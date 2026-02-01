"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";

export async function createUser(user: any) {
    try {
        await connectToDatabase();

        const newUser = await User.findOneAndUpdate(
            { clerkId: user.clerkId },
            user,
            { upsert: true, new: true }
        );

        return JSON.parse(JSON.stringify(newUser));
    } catch (error: any) {
        // Handle duplicate email error (code 11000) by claiming the existing user
        if (error.code === 11000 && error.keyPattern?.email) {
            console.log("Duplicate email detected. Reclaiming existing account for new Clerk ID.");
            const existingUser = await User.findOneAndUpdate(
                { email: user.email },
                user,
                { new: true }
            );
            return JSON.parse(JSON.stringify(existingUser));
        }

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
