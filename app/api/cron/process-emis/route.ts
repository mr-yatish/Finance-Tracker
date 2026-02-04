import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Emi from "@/lib/database/models/emi.model";
import Transaction from "@/lib/database/models/transaction.model";

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Optional: Protect cron route. For now, we'll allow it or check env.
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find Active EMIs where Next Payment Date <= Today
        const dueEmis = await Emi.find({
            status: 'active',
            nextPaymentDate: { $lte: today }
        });

        if (dueEmis.length === 0) {
            return NextResponse.json({ message: 'No EMIs due globally.' });
        }

        const results = [];

        for (const emi of dueEmis) {
            // Check if we already created a transaction for this scheduled date?
            // "lastPaymentDate" is updated on payment.
            // But if it's "Pending", we might duplicate if cron runs twice?
            // We should check if a transaction exists for this EMI on "nextPaymentDate" approx.

            // Safe redundancy check:
            // Find transaction for this EMI with Date == nextPaymentDate (approx)
            const exists = await Transaction.findOne({
                emi: emi._id,
                date: {
                    $gte: new Date(emi.nextPaymentDate.setHours(0, 0, 0, 0)),
                    $lt: new Date(emi.nextPaymentDate.setHours(23, 59, 59, 999))
                }
            });

            if (exists) {
                results.push({ id: emi._id, status: 'Already Processed' });
                continue;
            }

            // Create Transaction
            const isAutoDebit = emi.autoDebit;
            const status = isAutoDebit ? 'completed' : 'pending';

            // Calculate Interest/Principal split for record
            // (Same simple logic as in recordEmiPayment)
            const monthlyRate = emi.interestRate / 12 / 100;
            const interestComponent = Math.round(emi.remainingAmount * monthlyRate);
            const principalComponent = emi.emiAmount - interestComponent;

            // Create the Transaction
            await Transaction.create({
                user: emi.user,
                amount: emi.emiAmount,
                type: 'expense',
                category: 'EMI',
                description: `EMI Payment: ${emi.name}`,
                date: emi.nextPaymentDate,
                paymentMethod: 'online', // Default
                bankAccount: emi.bankAccount,
                emi: emi._id,
                status: status
            });

            // Update EMI
            // If Auto-Debit (Paid), validation checks pass, we update "Remaining" immediately.
            // If Pending, do we update "Remaining"? 
            // Usually NO. Only when "Paid".
            // So Pending transaction is just a "Bill".

            if (isAutoDebit) {
                let newRemaining = emi.remainingAmount - principalComponent;
                if (newRemaining < 0) newRemaining = 0;

                const historyEntry = {
                    transactionId: null, // We could link, but handled via query
                    date: emi.nextPaymentDate,
                    amount: emi.emiAmount,
                    type: 'regular',
                    interestComponent,
                    principalComponent
                };

                // Move next payment date by 1 month
                const nextDate = new Date(emi.nextPaymentDate);
                nextDate.setMonth(nextDate.getMonth() + 1);

                await Emi.findByIdAndUpdate(emi._id, {
                    $push: { history: historyEntry },
                    $set: {
                        remainingAmount: newRemaining,
                        lastPaymentDate: today,
                        nextPaymentDate: nextDate,
                        status: newRemaining <= 0 ? 'closed' : 'active'
                    }
                });
            } else {
                // For Pending, we do NOT move the date yet? 
                // Or we move it to keep schedule, but "Remaining" stays?
                // Requirement: "Handle missed EMI cases".
                // If status is Pending, we notify user. The "Debt" implies it needs action.
                // We should probably NOT update specific EMI math until confirmed paid.
                // BUT we need to avoid Cron keeping hitting it.
                // We could set a flag "lastProcessedDate".
                // Or we rely on the existence of the "Pending" transaction to skip (checked above).
                // YES, the "exists" check handles it!
            }

            results.push({ id: emi._id, status: isAutoDebit ? 'Auto-Debited' : 'Marked Pending' });
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });

    } catch (error: any) {
        console.error("Cron Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
