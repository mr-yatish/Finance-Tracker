"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";
import { logEvent, LogLevel } from "@/lib/actions/logger.actions";

export async function createUser(user: any) {
    try {
        await logEvent({
            action: "createUser",
            message: "Attempting to create/sync user",
            details: { clerkId: user.clerkId, email: user.email }
        });

        await connectToDatabase();

        const cleanUser = { ...user };
        if (!cleanUser.username) {
            cleanUser.username = cleanUser.email?.split('@')[0] || `user_${cleanUser.clerkId.slice(0, 8)}`;
        }

        await logEvent({
            action: "createUser",
            message: "Database connected, attempting upsert",
            details: { clerkId: user.clerkId }
        });

        const newUser = await User.findOneAndUpdate(
            { clerkId: user.clerkId },
            cleanUser,
            { upsert: true, new: true }
        );

        await logEvent({
            action: "createUser",
            message: "User created/updated successfully",
            details: { userId: newUser._id, clerkId: user.clerkId }
        });

        return JSON.parse(JSON.stringify(newUser));
    } catch (error: any) {
        // Handle duplicate email error (code 11000) by claiming the existing user
        if (error.code === 11000 && error.keyPattern?.email) {
            await logEvent({
                action: "createUser",
                level: LogLevel.WARN,
                message: "Duplicate email detected, reclaiming account",
                details: { email: user.email }
            });

            const existingUser = await User.findOneAndUpdate(
                { email: user.email },
                user,
                { new: true }
            );
            return JSON.parse(JSON.stringify(existingUser));
        }

        await logEvent({
            action: "createUser",
            level: LogLevel.ERROR,
            message: "Failed to create user",
            details: {
                clerkId: user.clerkId,
                email: user.email,
                error: error.message,
                stack: error.stack,
                code: error.code
            }
        });

        console.error("Error creating user:", error);
        throw new Error(`Failed to create user: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
}

export async function getUserById(clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.log(error);
        throw new Error("Failed to get user");
    }
}
