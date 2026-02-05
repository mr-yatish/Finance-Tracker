"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";
import AuditLog from "@/lib/database/models/audit-log.model";
import Transaction from "@/lib/database/models/transaction.model";
import Emi from "@/lib/database/models/emi.model";
import SystemConfig from "@/lib/database/models/system-config.model";
import SystemLog from "@/lib/database/models/system-log.model";
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

    // Get Maintenance Status
    const maintenanceConfig = await SystemConfig.findOne({ key: 'MAINTENANCE_MODE' });
    const isMaintenanceMode = maintenanceConfig?.value === true;

    return {
        totalUsers,
        activeUsers,
        totalVolume,
        activeEmis,
        isMaintenanceMode
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
// Fetch Admin Logs
export async function getAdminLogs(filters?: {
    action?: string;
    entity?: string;
    performedBy?: string;
    search?: string;
    page?: number;
    limit?: number;
}) {
    await checkAdmin();
    await connectToDatabase();

    const query: any = {};
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    if (filters?.action && filters.action !== 'ALL') {
        query.action = filters.action;
    }

    if (filters?.entity && filters.entity !== 'ALL') {
        query.entity = filters.entity;
    }

    if (filters?.performedBy) {
        query.performedBy = filters.performedBy;
    }

    if (filters?.search) {
        query.$or = [
            { entityId: { $regex: filters.search, $options: 'i' } },
            { 'details.error': { $regex: filters.search, $options: 'i' } },
        ];
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await AuditLog.countDocuments(query);

    return {
        logs: JSON.parse(JSON.stringify(logs)),
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalLogs: total
    };
}

export async function toggleMaintenanceMode(enabled: boolean) {
    await checkAdmin();
    await connectToDatabase();

    const currentUser = await auth();

    await SystemConfig.findOneAndUpdate(
        { key: 'MAINTENANCE_MODE' },
        {
            key: 'MAINTENANCE_MODE',
            value: enabled,
            description: 'Global maintenance mode flag'
        },
        { upsert: true, new: true }
    );

    await AuditLog.create({
        action: 'TOGGLE_MAINTENANCE',
        entity: 'SYSTEM',
        performedBy: currentUser.userId || 'system',
        details: { enabled }
    });

    revalidatePath('/');
    return { success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` };
}

// Generic System Config Management
export async function getSystemConfig(key: string) {
    await checkAdmin();
    await connectToDatabase();
    const config = await SystemConfig.findOne({ key });
    return config ? JSON.parse(JSON.stringify(config)) : null;
}

export async function updateSystemConfig(key: string, value: any, description?: string) {
    await checkAdmin();
    await connectToDatabase();

    const currentUser = await auth();

    const config = await SystemConfig.findOneAndUpdate(
        { key },
        {
            key,
            value,
            ...(description && { description })
        },
        { upsert: true, new: true }
    );

    // Log the update
    await AuditLog.create({
        action: 'UPDATE_CONFIG',
        entity: 'SYSTEM_CONFIG',
        entityId: key,
        performedBy: currentUser.userId || 'system',
        details: { key, value }
    });

    revalidatePath('/admin');
    return { success: true, data: JSON.parse(JSON.stringify(config)) };
}

// Fetch System Logs (User App Logs)
export async function getSystemLogs(filters?: {
    level?: string;
    action?: string;
    userId?: string;
    search?: string;
    page?: number;
    limit?: number;
}) {
    await checkAdmin();
    await connectToDatabase();

    const query: any = {};
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    if (filters?.level && filters.level !== 'ALL') {
        query.level = filters.level;
    }

    if (filters?.action && filters.action !== 'ALL') {
        // Allow partial match on action for flexibility or exact
        query.action = filters.action;
    }

    if (filters?.userId) {
        query.userId = filters.userId;
    }

    if (filters?.search) {
        query.$or = [
            { message: { $regex: filters.search, $options: 'i' } },
            { action: { $regex: filters.search, $options: 'i' } },
            { userId: { $regex: filters.search, $options: 'i' } },
        ];
    }

    const logs = await SystemLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit);
    const total = await SystemLog.countDocuments(query);

    return {
        logs: JSON.parse(JSON.stringify(logs)),
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalLogs: total
    };
}

export async function getMaintenanceStatus() {
    await connectToDatabase();
    const config = await SystemConfig.findOne({ key: 'MAINTENANCE_MODE' });
    return config?.value === true;
}
