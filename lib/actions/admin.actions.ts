"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";
import AuditLog from "@/lib/database/models/audit-log.model";
import Transaction from "@/lib/database/models/transaction.model";
import Emi from "@/lib/database/models/emi.model";
import { checkAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// Fetch Global Stats
export async function getGlobalStats() {
    await checkAdmin();
    await connectToDatabase();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Aggregation for total volume
    const volumeResult = await Transaction.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalVolume = volumeResult[0]?.total || 0;

    const activeEmis = await Emi.countDocuments({ status: 'active' });

    return {
        totalUsers,
        activeUsers,
        totalVolume,
        activeEmis
    };
}

// Fetch All Users for DataTable
export async function getAllUsers() {
    await checkAdmin();
    await connectToDatabase();

    const users = await User.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
}

// Update User Role and Permissions
export async function updateUserRole(userId: string, role: string, permissions: string[] = []) {
    await checkAdmin();
    await connectToDatabase();

    const currentUser = await auth();
    const performedBy = currentUser.userId || "system";

    try {
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) throw new Error("User not found");

        // Update MongoDB
        userToUpdate.role = role;
        userToUpdate.permissions = permissions;
        await userToUpdate.save();

        // Update Clerk Metadata
        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(userToUpdate.clerkId, {
                publicMetadata: {
                    role: role,
                    permissions: permissions
                }
            });
        } catch (clerkError: any) {
            console.error("Failed to update Clerk metadata (skipping):", clerkError);
            // We don't throw here to allow the DB update to persist. 
            // In production, this might need a retry queue or stronger consistency check.
            // Usually implies user deleted in Clerk but present in DB.
        }

        // Log the action
        await AuditLog.create({
            action: 'UPDATE_ROLE',
            entity: 'USER',
            entityId: userId,
            details: { role, permissions },
            performedBy: performedBy
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user role:", error);
        await AuditLog.create({
            action: 'UPDATE_ROLE_FAILED',
            entity: 'USER',
            entityId: userId,
            details: { error: error.message },
            performedBy: performedBy,
            status: 'FAILURE'
        });
        throw new Error(`Failed to update user role: ${error.message}`);
    }
}

// Fetch Admin Logs
export async function getAdminLogs() {
    await checkAdmin();
    await connectToDatabase();

    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return JSON.parse(JSON.stringify(logs));
}

export async function toggleMaintenanceMode(enabled: boolean) {
    await checkAdmin();
    // Implementation requires external config store.
    console.log("Maintenance mode toggle:", enabled);
    return { success: true, message: "Maintenance toggle logged. Requires deployment or DB config to persist." };
}
