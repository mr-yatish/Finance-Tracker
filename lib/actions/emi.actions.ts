'use server'

import { revalidatePath } from "next/cache";
import { addMonths } from "date-fns";
import { connectToDatabase } from "../database/mongoose";

import Emi from "../database/models/emi.model";
import User from "../database/models/user.model";
import Transaction from "../database/models/transaction.model"; // Import Transaction
import { handleError } from "../utils";

// Types
export interface CreateEmiParams {
    userId: string;
    name: string;
    loanType: string;
    totalAmount: number;
    interestRate: number;
    gstRate?: number;
    tenureMonths: number;
    installmentsPaid?: number;
    startDate: Date;
    lender: string;
    autoDebit?: boolean;
    bankAccountId?: string;
    path: string;
}

// Helper: Calculate EMI
function calculateEmiAmount(principal: number, annualRate: number, months: number): number {
    if (annualRate === 0) return Math.round(principal / months);
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
}

// Helper: Calculate End Date
function calculateEndDate(startDate: Date, months: number): Date {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date;
}

// CREATE
export async function createEmi(params: CreateEmiParams) {
    try {
        await connectToDatabase();


        const { userId, name, loanType, totalAmount, interestRate, gstRate = 0, tenureMonths, installmentsPaid = 0, startDate, lender, autoDebit, bankAccountId, path } = params;

        // userId passed here is usually CLERK ID from frontend currentUser().id
        // But we need Mongo ID for referencing.
        const user = await User.findOne({ clerkId: userId });
        if (!user) throw new Error("User not found");

        const emiAmount = calculateEmiAmount(totalAmount, interestRate, tenureMonths);
        const endDate = calculateEndDate(startDate, tenureMonths);

        // Calculate pre-paid impact if any
        let remainingAmount = totalAmount;
        let nextPaymentDate = new Date(startDate);

        // If installments are already paid, we simulate them to reduce balance
        // We move nextPaymentDate forward by 'installmentsPaid' + 1 months (next due)
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + installmentsPaid + 1);

        if (installmentsPaid > 0) {
            // Calculate how much principal was paid in those months
            // We need to run the amortization logic briefly
            const annualRate = interestRate;
            const monthlyRate = annualRate / 12 / 100;
            let balance = totalAmount;

            for (let i = 1; i <= installmentsPaid; i++) {
                const interest = balance * monthlyRate;
                const principalPart = emiAmount - interest;
                balance = balance - principalPart;
            }
            // Balance after N payments is the new remaining amount
            remainingAmount = Math.max(0, Math.round(balance));
        } else {
            // Default behavior: First payment next month
            nextPaymentDate = new Date(startDate);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }

        const newEmi = await Emi.create({
            user: user._id,
            name,
            loanType,
            totalAmount,
            interestRate,
            gstRate,
            tenureMonths,
            startDate,
            endDate,
            emiAmount,
            remainingAmount: remainingAmount,
            lender,
            autoDebit: autoDebit || false,
            bankAccount: bankAccountId,
            nextPaymentDate,
            history: []
        });

        revalidatePath(path);
        return JSON.parse(JSON.stringify(newEmi));
    } catch (error) {
        handleError(error);
    }
}

// GET ALL for User
export async function getEmisByUser(clerkId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            // Just return empty if user not synced yet, or throw
            return [];
        }

        const emis = await Emi.find({ user: user._id }).sort({ nextPaymentDate: 1 });

        return JSON.parse(JSON.stringify(emis));
    } catch (error) {
        handleError(error);
    }
}

// GET ONE
export async function getEmiById(emiId: string) {
    try {
        await connectToDatabase();

        const emi = await Emi.findById(emiId).populate('bankAccount');
        if (!emi) throw new Error("EMI not found");

        return JSON.parse(JSON.stringify(emi));
    } catch (error) {
        handleError(error);
    }
}

// DELETE
export async function deleteEmi(emiId: string, path: string) {
    try {
        await connectToDatabase();

        // Check if exists
        const deletedEmi = await Emi.findByIdAndDelete(emiId);
        if (deletedEmi) revalidatePath(path);

    } catch (error) {
        handleError(error);
    }
}

// CALCULATION LOGIC: Generate Amortization Schedule
export async function getAmortizationSchedule(emiId: string) {
    try {
        await connectToDatabase();
        const emi = await Emi.findById(emiId);
        if (!emi) throw new Error("EMI not found");

        const principal = emi.totalAmount;
        const annualRate = emi.interestRate;
        const gstRate = emi.gstRate || 0;
        const tenureMonths = emi.tenureMonths;
        const startDate = new Date(emi.startDate);
        const monthlyRate = annualRate / 12 / 100;

        let balance = principal;
        const schedule = [];

        const emiAmount = calculateEmiAmount(principal, annualRate, tenureMonths);

        for (let i = 1; i <= tenureMonths; i++) {
            const interest = balance * monthlyRate;
            const gst = interest * (gstRate / 100);
            const principalPart = emiAmount - interest;
            balance = balance - principalPart;

            if (balance < 0) balance = 0;

            const paymentDate = addMonths(startDate, i);

            schedule.push({

                installmentNumber: i,
                paymentDate: paymentDate,
                openingBalance: Math.round(balance + principalPart),
                emi: Math.round(emiAmount + gst), // Total to pay includes GST
                baseEmi: emiAmount,
                principal: Math.round(principalPart),
                interest: Math.round(interest),
                gst: Math.round(gst),
                closingBalance: Math.round(balance)
            });
        }

        return JSON.parse(JSON.stringify(schedule));
    } catch (error) {
        handleError(error);
    }
}

// RECORD PAYMENT (Manual or Auto)
export async function recordEmiPayment({
    emiId,
    amount,
    date,
    isPrepayment = false,
    paymentMethod = 'online',
    path
}: {
    emiId: string,
    amount: number,
    date: Date,
    isPrepayment?: boolean,
    paymentMethod?: 'online' | 'cash',
    path: string
}) {
    try {
        await connectToDatabase();
        const emi = await Emi.findById(emiId);
        if (!emi) throw new Error("EMI not found");

        const monthlyRate = emi.interestRate / 12 / 100;

        let interestComponent = 0;
        let principalComponent = 0;
        let gstComponent = 0;

        if (isPrepayment) {
            interestComponent = 0;
            gstComponent = 0;
            principalComponent = amount;
        } else {
            // Calculate interest on remaining principal
            interestComponent = Math.round(emi.remainingAmount * monthlyRate);
            // Calculate GST on that interest
            gstComponent = Math.round(interestComponent * ((emi.gstRate || 0) / 100));
            // Principal is the rest of the payment
            principalComponent = amount - interestComponent - gstComponent;
        }

        let newRemaining = emi.remainingAmount - principalComponent;

        if (newRemaining < 0) newRemaining = 0;

        await Transaction.create({
            user: emi.user,
            amount: amount,
            type: 'expense',
            category: 'EMI',
            description: `Payment for ${emi.name} (${isPrepayment ? 'Prepayment' : 'Installment'})`,
            date: date,
            paymentMethod: paymentMethod,
            bankAccount: emi.bankAccount,
            emi: emi._id
        });

        const historyEntry = {
            date: date,
            amount: amount,
            type: isPrepayment ? 'prepayment' : 'regular',
            interestComponent,
            gstComponent,
            principalComponent
        };


        let status = emi.status;
        if (newRemaining <= 0) {
            status = 'closed';
        }

        let nextPayment = new Date(emi.nextPaymentDate);
        if (!isPrepayment) {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
        }

        const updatedEmi = await Emi.findByIdAndUpdate(emiId, {
            $push: { history: historyEntry },
            $set: {
                remainingAmount: newRemaining,
                status: status,
                lastPaymentDate: date,
                nextPaymentDate: nextPayment
            }
        }, { new: true });

        revalidatePath(path);
        return JSON.parse(JSON.stringify(updatedEmi));

    } catch (error) {
        handleError(error);
    }
}

// WRAPPERS for Frontend Convenience
export async function processEmiPayment(emiId: string, amount?: number) {
    const emi = await Emi.findById(emiId);
    if (!emi) throw new Error("EMI not found");

    // If amount is not provided, we fallback to base emiAmount (which is without GST/Interest usually)
    // But ideally we want the UI to pass the correct amount from schedule
    const finalAmount = amount || emi.emiAmount;

    return await recordEmiPayment({
        emiId,
        amount: finalAmount,
        date: new Date(),
        isPrepayment: false,
        path: `/emis/${emiId}`
    });
}


export async function prepayEmi({ emiId, amount, path }: { emiId: string, amount: number, path: string }) {
    return await recordEmiPayment({
        emiId,
        amount,
        date: new Date(),
        isPrepayment: true,
        path
    });
}


// DELETE PAYMENT
export async function deleteEmiPayment({ emiId, historyId, path }: { emiId: string, historyId: string, path: string }) {
    try {
        await connectToDatabase();
        const emi = await Emi.findById(emiId);
        if (!emi) throw new Error("EMI not found");

        // Find the history item
        const historyItem = emi.history.find((h: any) => h._id.toString() === historyId);
        if (!historyItem) throw new Error("Payment record not found");

        // Reverse the balance
        // We add back the PRINCIPAL component to the remaining amount.
        const principalRestored = historyItem.principalComponent;
        let newRemaining = emi.remainingAmount + principalRestored;

        // Cap at totalAmount just in case of weird floating point issues, though unlikely if logic is sound
        if (newRemaining > emi.totalAmount) newRemaining = emi.totalAmount;

        // If status was closed, it might become active again
        let status = emi.status;
        if (status === 'closed' && newRemaining > 0) {
            status = 'active';
        }

        // Delete the associated Transaction if it exists
        // History might not have transactionId if it was a migration or older data, but better to check.
        // The history schema has `transactionId`? Let's check model. 
        // Yes: transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" }
        if (historyItem.transactionId) {
            await Transaction.findByIdAndDelete(historyItem.transactionId);
        }

        // Update EMI: Pull from history, Set new remaining
        await Emi.findByIdAndUpdate(emiId, {
            $pull: { history: { _id: historyId } },
            $set: {
                remainingAmount: newRemaining,
                status: status
            }
        });

        revalidatePath(path);

    } catch (error) {
        handleError(error);
    }
}
