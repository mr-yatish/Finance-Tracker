"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import Transaction from "@/lib/database/models/transaction.model";
import User from "@/lib/database/models/user.model";
import { revalidatePath } from "next/cache";

async function migrateTransactions(userId: any) {
    try {
        await Transaction.updateMany({ user: userId, type: { $exists: false }, isIncome: true }, { $set: { type: 'income' }, $unset: { isIncome: "" } });
        await Transaction.updateMany({ user: userId, type: { $exists: false }, isIncome: { $ne: true } }, { $set: { type: 'expense' }, $unset: { isIncome: "" } });
    } catch (error) {
        console.error("Migration failed", error);
    }
}

export async function createTransaction(transactionData: any, clerkId: string) {
    try {
        await connectToDatabase();
        console.log("SERVER ACTION: createTransaction INPUT", transactionData);
        console.log("SERVER ACTION: createTransaction TYPE", transactionData.type);

        const user = await User.findOne({ clerkId });
        if (!user) throw new Error("User not found");

        const type = transactionData.type || 'expense';
        const isIncome = type === 'income';

        console.log("SERVER ACTION: Creating with", { type, isIncome });

        const newTransaction = await Transaction.create({
            ...transactionData,
            type,
            isIncome,
            user: user._id,
        });

        // 🔔 Send notification
        try {
            console.log("🔔 Transaction Notification: Starting...");
            const { createNotification } = await import("@/lib/actions/notification.actions");

            const notificationPayload = {
                title: `${isIncome ? "💰" : "💸"} ${isIncome ? "Income" : "Expense"} Recorded`,
                message: `₹${transactionData.amount.toLocaleString()} - ${transactionData.category}${transactionData.description ? ": " + transactionData.description : ""}`,
                type: "transaction" as const,
                data: {
                    transactionId: newTransaction._id.toString(),
                    amount: transactionData.amount.toString(),
                    category: transactionData.category,
                },
                actionUrl: "/transactions",
                sendPush: true, // ⚠️ Push should be enabled
            };

            console.log("🔔 Transaction Notification: Payload:", JSON.stringify(notificationPayload, null, 2));
            console.log("🔔 Transaction Notification: sendPush =", notificationPayload.sendPush);

            const notifResult = await createNotification(clerkId, notificationPayload);

            console.log("🔔 Transaction Notification: Result:", notifResult);

            if (!notifResult.success) {
                console.error("❌ Transaction Notification: Failed -", notifResult.error);
            } else {
                console.log("✅ Transaction Notification: Success - ID:", notifResult.notificationId);
            }
        } catch (notifError) {
            // Don't fail transaction if notification fails
            console.error("❌ Transaction Notification: Exception -", notifError);
        }

        revalidatePath("/transactions");
        revalidatePath("/dashboard");
        revalidatePath("/analytics");

        return JSON.parse(JSON.stringify(newTransaction));
    } catch (error) {
        console.log(error);
        throw new Error("Failed to create transaction");
    }
}

export async function updateTransaction(transactionId: string, transactionData: any, clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        if (!user) throw new Error("User not found");

        const type = transactionData.type || 'expense';
        const isIncome = type === 'income';

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: transactionId, user: user._id },
            { ...transactionData, type, isIncome },
            { new: true }
        );

        if (!updatedTransaction) throw new Error("Transaction not found or unauthorized");

        revalidatePath("/transactions");
        revalidatePath("/dashboard");
        revalidatePath("/analytics");

        return JSON.parse(JSON.stringify(updatedTransaction));
    } catch (error) {
        console.log(error);
        throw new Error("Failed to update transaction");
    }
}

export async function deleteTransaction(transactionId: string, clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        if (!user) throw new Error("User not found");

        const deletedTransaction = await Transaction.findOneAndDelete({ _id: transactionId, user: user._id });

        if (!deletedTransaction) throw new Error("Transaction not found or unauthorized");

        revalidatePath("/transactions");
        revalidatePath("/dashboard");
        revalidatePath("/analytics");

        return JSON.parse(JSON.stringify(deletedTransaction));
    } catch (error) {
        console.log(error);
        throw new Error("Failed to delete transaction");
    }
}

export async function getTransactions(clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        if (!user) return [];
        await migrateTransactions(user._id);

        const transactions = await Transaction.find({ user: user._id })
            .sort({ date: -1 })
            .populate({
                path: 'bankAccount',
                populate: {
                    path: 'bank',
                    model: 'Bank'
                }
            });
        console.log("SERVER ACTION: getTransactions sample", transactions[0]);
        return JSON.parse(JSON.stringify(transactions));
    } catch (error: any) {
        console.error("Error in getTransactions:", error);
        throw new Error(`Failed to get transactions: ${error.message}`);
    }
}

export async function getSummaryStats(clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        if (!user) return { balance: 0, income: 0, expense: 0, chartData: [], recentTransactions: [] };

        // Use aggregation to calculate totals efficiently without fetching all docs
        const totals = await Transaction.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
                    // Calculate Bank Balance (Online)
                    bankIncome: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "income"] }, { $eq: ["$paymentMethod", "online"] }] }, "$amount", 0] } },
                    bankExpense: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "expense"] }, { $eq: ["$paymentMethod", "online"] }] }, "$amount", 0] } },
                    // Calculate Cash Balance (Cash)
                    cashIncome: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "income"] }, { $eq: ["$paymentMethod", "cash"] }] }, "$amount", 0] } },
                    cashExpense: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "expense"] }, { $eq: ["$paymentMethod", "cash"] }] }, "$amount", 0] } }
                }
            }
        ]);

        const income = totals[0]?.income || 0;
        const expense = totals[0]?.expense || 0;
        const balance = income - expense;

        const bankBalance = (totals[0]?.bankIncome || 0) - (totals[0]?.bankExpense || 0);
        const cashBalance = (totals[0]?.cashIncome || 0) - (totals[0]?.cashExpense || 0);

        const bankExpense = totals[0]?.bankExpense || 0;
        const cashExpense = totals[0]?.cashExpense || 0;

        // Recent transactions (Fetch only 5)
        const recentTransactions = await Transaction.find({ user: user._id })
            .sort({ date: -1 })
            .limit(5);

        // Chart Data (Last 6 months expenses) - Efficient Aggregation
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of month

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    user: user._id,
                    type: 'expense',
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$date" }, // Group by month number (1-12)
                    total: { $sum: "$amount" }
                }
            }
        ]);

        // Map aggregation result to simplified chart data format ensuring correct order
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartDataArray = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthIndex = d.getMonth(); // 0-11
            const monthName = monthNames[monthIndex];

            // Find data for this month (MongoDB $month returns 1-12)
            const stats = monthlyData.find(m => m._id === monthIndex + 1);
            chartDataArray.push({
                name: monthName,
                total: stats?.total || 0
            });
        }

        return {
            balance,
            income,
            expense,
            chartData: chartDataArray,
            recentTransactions: JSON.parse(JSON.stringify(recentTransactions)),
            bankBalance,
            cashBalance,
            bankExpense,
            cashExpense
        };

    } catch (error: any) {
        console.error("Error in getSummaryStats:", error);
        throw new Error(`Failed to get summary: ${error.message}`);
    }
}

export async function getAnalyticsData(clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        if (!user) return { categoryStats: [], monthlyStats: [] };

        const userId = user._id;

        // Category Stats (Expenses only)
        const categoryStats = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: "$category", value: { $sum: "$amount" } } },
            { $project: { name: "$_id", value: 1, _id: 0 } },
            { $sort: { value: -1 } }
        ]);

        // Monthly Stats (Last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);

        const monthlyRaw = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        type: "$type"
                    },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        // Process Monthly Data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyStats = [];

        for (let i = 0; i < 12; i++) {
            const d = new Date(); // Start from current month? Or Jan-Dec?
            // Usually "Last 12 months" means previous 11 + current.
            // But prompt implied "Jan" to "Dec" static list loop in previous code, which is weird if not year aligned.
            // Let's stick to "Last 12 months" rolling window for analytics or just display current year?
            // The previous code did `const monthNames = [...]; for (let i=0; i<12; i++)`. This implies Jan-Dec fixed.
            // Let's assume Jan-Dec for simplification or do rolling if preferred.
            // The previous logic pushed `monthNames[i]` which is Jan..Dec. So it was a fixed year view (or assumed data is from this year).
            // Better to show Jan..Dec order.

            const monthName = monthNames[i];
            const incomeData = monthlyRaw.find(m => m._id.month === (i + 1) && m._id.type === 'income');
            const expenseData = monthlyRaw.find(m => m._id.month === (i + 1) && m._id.type === 'expense');

            monthlyStats.push({
                name: monthName,
                income: incomeData?.total || 0,
                expense: expenseData?.total || 0
            });
        }

        // Payment Method Stats
        const paymentMethodStats = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: "$paymentMethod", value: { $sum: "$amount" } } },
            { $project: { name: { $ifNull: ["$_id", "online"] }, value: 1, _id: 0 } } // Default to online if null
        ]);

        // Bank Account Stats (Online Expenses)
        const bankStats = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense', paymentMethod: 'online' } },
            {
                $lookup: {
                    from: "bankaccounts",
                    localField: "bankAccount",
                    foreignField: "_id",
                    as: "account"
                }
            },
            { $unwind: { path: "$account", preserveNullAndEmptyArrays: false } },
            {
                $lookup: {
                    from: "banks",
                    localField: "account.bank",
                    foreignField: "_id",
                    as: "bankInfo"
                }
            },
            { $unwind: { path: "$bankInfo", preserveNullAndEmptyArrays: false } },
            { $group: { _id: "$bankInfo.name", value: { $sum: "$amount" } } },
            { $project: { name: "$_id", value: 1, _id: 0 } },
            { $sort: { value: -1 } }
        ]);

        return { categoryStats, monthlyStats, paymentMethodStats, bankStats };
    } catch (error: any) {
        console.error("Error in getAnalyticsData:", error);
        throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }
}
