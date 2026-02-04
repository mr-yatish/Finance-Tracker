'use server'
// Force rebuild for CastError fix

import { connectToDatabase } from "../database/mongoose";
import Emi from "../database/models/emi.model";
import Transaction from "../database/models/transaction.model";
import User from "../database/models/user.model";
import { handleError } from "../utils";

export async function fetchBudgetSummary(userId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            throw new Error("User not found");
        }

        // 1. Calculate Average Monthly Income (Last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const incomeStats = await Transaction.aggregate([
            {
                $match: {
                    user: user._id,
                    type: 'income',
                    date: { $gte: threeMonthsAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: "$amount" }
                }
            }
        ]);

        // Approximate monthly income (Total / 3). 
        // If usage is < 3 months, this might be skewed, but it's a start.
        // Ideally we count actual distinct months, but div by 3 is safer for "Average" stability.
        // Better: Get avg of non-zero months? Let's generic to Total / 3 for now or just take "This Month"
        // Requirement says "Monthly Income". Let's stick to "Current Month Income" for "Current Month Budget".

        const startOfMonth = new Date();
        startOfMonth.setDate(1); // 1st of current month

        // Get THIS MONTH's Income
        const currentMonthIncomeStats = await Transaction.aggregate([
            {
                $match: {
                    user: user._id,
                    type: 'income',
                    date: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const monthlyIncome = currentMonthIncomeStats[0]?.total || 0;

        // 2. Fetch Fixed Expenses (Recursive/subscription logic not implemented yet, using Actual Expenses)
        // Requirement: "Fixed Expenses". This usually implies Rent, Bills etc. 
        // Since we don't have "Fixed" tag, we'll sum "expense" this month.

        const currentMonthExpensesStats = await Transaction.aggregate([
            {
                $match: {
                    user: user._id,
                    type: 'expense',
                    date: { $gte: startOfMonth },
                    // Exclude auto-posted EMIs from "Fixed Expenses" here to avoid double counting 
                    // IF we treat EMI separately. 
                    // BUT, if EMI is auto-posted, it IS in transactions.
                    // We need to distinguish "EMI Obligation" (Planned) vs "EMI Paid" (Actual).
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const totalExpenses = currentMonthExpensesStats[0]?.total || 0;


        // 3. Active EMI Obligations
        // Sum of 'emiAmount' for all active EMIs
        const activeEmis = await Emi.find({
            user: user._id,
            status: 'active'
        });

        const totalEmiObligation = activeEmis.reduce((sum: number, emi: any) => sum + emi.emiAmount, 0);

        // 4. "Spendable Amount" logic
        // Spendable = Income - EMI Obligation - Other Expenses
        // BUT wait. If EMI is already paid (transaction exists), `totalExpenses` includes it.
        // If EMI is NOT paid yet, `totalExpenses` does NOT include it, but `totalEmiObligation` DOES.
        // So we need to be careful not to double subtract.

        // Logic:
        // Total Commitments = Total EMI Obligation.
        // Remaining to Pay = EMIs not yet paid this month.
        // This requires checking strictly if an EMI has a transaction for this month.

        let paidEmiAmount = 0;
        // Check if any transactions this month are linked to these EMIs
        // Since we just added `emi` field to Transaction, we can check that.

        const emiTransactions = await Transaction.find({
            user: user._id,
            type: 'expense',
            date: { $gte: startOfMonth },
            emi: { $in: activeEmis.map((e: any) => e._id) }
        });

        paidEmiAmount = emiTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);

        // Unpaid Obligations
        const unpaidEmiObligation = totalEmiObligation - paidEmiAmount;
        // (Note: if user paid *more* (prepayment), this might be negative, handle that? 
        // Requirement says "EMI amount must be locked". Assume fixed obligation.)
        const strictUnpaidEmi = Math.max(0, totalEmiObligation - paidEmiAmount);

        // Non-EMI Expenses
        const nonEmiExpenses = totalExpenses - paidEmiAmount;

        // Final Formula
        // Available to Spend = Income - (Paid EMI + Unpaid EMI + Non-EMI Expenses)
        //                    = Income - (Total EMI Obligation + Non-EMI Expenses)
        // This assumes all EMIs *must* be paid.

        const spendable = monthlyIncome - totalEmiObligation - nonEmiExpenses;

        const overLeveraged = (totalEmiObligation / monthlyIncome) > 0.40;

        return {
            monthlyIncome,
            totalExpenses,
            totalEmiObligation,
            paidEmiAmount,
            unpaidEmiObligation: strictUnpaidEmi,
            nonEmiExpenses,
            spendable,
            overLeveraged,
            warnings: overLeveraged ? ["Warning: EMIs exceed 40% of income!"] : []
        };

    } catch (error) {
        handleError(error);
    }
}
