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
    } catch (error) {
        console.log(error);
        throw new Error("Failed to get transactions");
    }
}

export async function getSummaryStats(clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        if (!user) return { balance: 0, income: 0, expense: 0, chartData: [], recentTransactions: [] };
        await migrateTransactions(user._id);

        const transactions = await Transaction.find({ user: user._id }).sort({ date: -1 });

        let income = 0;
        let expense = 0;

        transactions.forEach((t: any) => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });

        const balance = income - expense;

        // Chart Data (Last 6 months expenses)
        const last6Months = new Map();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('default', { month: 'short' });
            last6Months.set(key, 0);
        }

        transactions.forEach((t: any) => {
            const d = new Date(t.date);
            // Simple check if within last 6 months approx (ignoring year wrap edge cases for simplicity in snippet, but map should handle generic string keys)
            // For rigorous check:
            const now = new Date();
            const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(now.getMonth() - 6);
            if (d > sixMonthsAgo && t.type === 'expense') {
                const key = d.toLocaleString('default', { month: 'short' });
                if (last6Months.has(key)) {
                    last6Months.set(key, last6Months.get(key) + t.amount);
                }
            }
        });

        const chartDataArray = Array.from(last6Months, ([name, total]) => ({ name, total }));

        return {
            balance,
            income,
            expense,
            chartData: chartDataArray,
            recentTransactions: JSON.parse(JSON.stringify(transactions.slice(0, 5)))
        };

    } catch (error) {
        console.log(error);
        throw new Error("Failed to get summary");
    }
}

export async function getAnalyticsData(clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        if (!user) return { categoryStats: [], monthlyStats: [] };
        await migrateTransactions(user._id);

        const transactions = await Transaction.find({ user: user._id }).sort({ date: -1 });

        // Category Stats
        const categoryMap = new Map();
        transactions.forEach((t: any) => {
            if (t.type === 'expense') {
                if (categoryMap.has(t.category)) {
                    categoryMap.set(t.category, categoryMap.get(t.category) + t.amount);
                } else {
                    categoryMap.set(t.category, t.amount);
                }
            }
        });

        const categoryStats = Array.from(categoryMap, ([name, value]) => ({ name, value }));

        // Monthly Stats (Last 12 months) - Simplified logic
        const monthlyStats: { name: string; income: number; expense: number }[] = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let i = 0; i < 12; i++) {
            monthlyStats.push({ name: monthNames[i], income: 0, expense: 0 });
        }

        transactions.forEach((t: any) => {
            const date = new Date(t.date);
            const monthIndex = date.getMonth();
            const type = t.type;
            if (monthlyStats[monthIndex]) {
                if (type === 'income') monthlyStats[monthIndex].income += t.amount;
                else monthlyStats[monthIndex].expense += t.amount;
            }
        });

        // Payment Method Stats
        const paymentMap = new Map();
        transactions.forEach((t: any) => {
            if (t.type === 'expense') {
                const method = t.paymentMethod || 'online'; // default to online for old recs if any
                if (paymentMap.has(method)) {
                    paymentMap.set(method, paymentMap.get(method) + t.amount);
                } else {
                    paymentMap.set(method, t.amount);
                }
            }
        });
        const paymentMethodStats = Array.from(paymentMap, ([name, value]) => ({ name, value }));

        // Bank Account Stats (for Online Expenses)
        const bankMap = new Map();
        transactions.forEach((t: any) => {
            if (t.type === 'expense' && (t.paymentMethod === 'online' || !t.paymentMethod)) {
                // If populated, bankAccount is an object. If not, check how it is returned. 
                // We need to fetch it with population in analytics too if we want names.
            }
        });

        // Re-fetch for detailed analytics population
        const detailedTransactions = await Transaction.find({ user: user._id, type: 'expense' }).populate({
            path: 'bankAccount',
            populate: { path: 'bank' }
        });

        detailedTransactions.forEach((t: any) => {
            if (t.paymentMethod === 'online' || !t.paymentMethod) {
                const bankName = t.bankAccount?.bank?.name || 'Unknown Bank';
                if (bankMap.has(bankName)) {
                    bankMap.set(bankName, bankMap.get(bankName) + t.amount);
                } else {
                    bankMap.set(bankName, t.amount);
                }
            }
        });

        const bankStats = Array.from(bankMap, ([name, value]) => ({ name, value }));

        return { categoryStats, monthlyStats, paymentMethodStats, bankStats };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch analytics data");
    }
}
