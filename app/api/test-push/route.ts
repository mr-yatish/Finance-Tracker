import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";
import UserDevice from "@/lib/database/models/user-device.model";
import { sendBatchPushNotification } from "@/lib/firebase/firebase-admin";

export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // Get user
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get user devices
        const devices = await UserDevice.find({
            userId: user._id,
            isActive: true,
        });

        if (devices.length === 0) {
            return NextResponse.json({
                error: "No devices found",
                message: "You need to enable notifications first"
            }, { status: 400 });
        }

        const tokens = devices.map(d => d.fcmToken);

        console.log("📱 Testing push to devices:", {
            userId,
            deviceCount: devices.length,
            tokens: tokens.map(t => t.substring(0, 20) + '...')
        });

        // Send test push notification
        const result = await sendBatchPushNotification(tokens, {
            title: "🔔 Push Notification Test",
            body: "If you see this, push notifications are working!",
            icon: "/icons/notification-icon.png",
            data: {
                actionUrl: "/dashboard",
                type: "test"
            },
        });

        return NextResponse.json({
            success: true,
            result,
            deviceCount: devices.length,
            tokens: tokens.length,
        });
    } catch (error: any) {
        console.error("Push test error:", error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
