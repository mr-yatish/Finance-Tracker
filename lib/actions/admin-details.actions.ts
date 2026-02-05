"use server";

import { checkAdmin } from "@/lib/rbac";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";
import Transaction from "@/lib/database/models/transaction.model";
import Emi from "@/lib/database/models/emi.model";
import { getTransactions, getSummaryStats } from "@/lib/actions/transaction.actions";
import { getEmisByUser, getAmortizationSchedule } from "@/lib/actions/emi.actions";

export async function getAdminUserDetails(userId: string) {
    await checkAdmin();
    await connectToDatabase();

    // userId passed is the Mongo _id
    const user = await User.findById(userId);
    if (!user) {
        console.error(`SERVER ACTION: getAdminUserDetails - User not found for ID: ${userId}`);
        throw new Error("User not found");
    }

    // Reuse existing actions by passing the user's clerkId
    // Note: ensure these actions don't internally depend on auth() for the target data if we pass an ID
    // Based on review, they operate on the passed clerkId

    // 1. Transactions
    const transactions = await getTransactions(user.clerkId);

    // 2. EMIs
    const emis = await getEmisByUser(user.clerkId);

    // 3. Stats
    // 3. Stats
    const stats = await getSummaryStats(user.clerkId);

    // 4. Enrich EMIs with Schedules
    // We want to avoid N+1 DB calls if possible, preventing blocking.
    // getAmortizationSchedule calls DB. Let's do it in parallel.
    const emisWithSchedule = await Promise.all(emis.map(async (emi: any) => {
        const schedule = await getAmortizationSchedule(emi._id);
        return { ...emi, schedule };
    }));

    return {
        user: JSON.parse(JSON.stringify(user)),
        transactions: JSON.parse(JSON.stringify(transactions)),
        emis: JSON.parse(JSON.stringify(emisWithSchedule)),
        stats: JSON.parse(JSON.stringify(stats))
    };
}
