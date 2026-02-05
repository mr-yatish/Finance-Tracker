import { config } from 'dotenv';
import path from 'path';

// Load env vars
config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import User from '../lib/database/models/user.model';
import { createClerkClient } from '@clerk/backend';

const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGODB_URI;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!MONGODB_URL) {
    console.error("Missing MONGODB_URL (or MONGODB_URI) in .env.local");
    process.exit(1);
}

if (!CLERK_SECRET_KEY) {
    console.error("Missing CLERK_SECRET_KEY in .env.local");
    process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

async function promoteUser(email: string) {
    try {
        await mongoose.connect(MONGODB_URL!);
        console.log("Connected to MongoDB");

        // Check if user exists (clerkId is usually the unique identifier, but we are querying by email for convenience script)
        // Ensure email query works even if some users are missing it, though model says required.
        const user = await User.findOne({ email: email });

        if (!user) {
            console.error(`User with email "${email}" not found in MongoDB.`);
            console.log("Please sign up internally first to sync the user to DB.");
            return;
        }

        console.log(`Found user: ${user.firstName} ${user.lastName} (${user.clerkId})`);
        console.log(`Current Role: ${user.role}`);

        // Update MongoDB
        user.role = 'ADMIN';
        user.permissions = ['DELETE_USER', 'EDIT_USER', 'VIEW_LOGS', 'MANAGE_BANKS', 'VIEW_ANALYTICS'];
        await user.save();
        console.log("✅ MongoDB User Updated to ADMIN");

        // Update Clerk Metadata
        await clerk.users.updateUserMetadata(user.clerkId, {
            publicMetadata: {
                role: 'ADMIN',
                permissions: user.permissions
            }
        });
        console.log("✅ Clerk Public Metadata Updated");

        console.log("\nSuccess! The user is now an Admin.");
        console.log("You can verify by checking the Clerk Dashboard or logging in at /admin");

    } catch (error) {
        console.error("Error promoting user:", error);
    } finally {
        await mongoose.disconnect();
    }
}

const email = process.argv[2];
if (!email || email.includes('your-email')) {
    console.log("\nUsage: npx tsx scripts/promote-admin.ts <email>");
    console.log("Example: npx tsx scripts/promote-admin.ts realuser@gmail.com\n");
    process.exit(1);
}

promoteUser(email);
