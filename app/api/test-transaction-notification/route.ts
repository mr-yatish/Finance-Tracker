import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/actions/notification.actions";

/**
 * Test endpoint to simulate a transaction notification
 */
export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Simulate a transaction notification
        const result = await createNotification(userId, {
            title: "💰 Income Recorded",
            message: "₹1,000 - Salary: Test transaction for push debugging",
            type: "transaction",
            data: {
                transactionId: "test-123",
                amount: "1000",
                category: "Salary",
            },
            actionUrl: "/transactions",
            sendPush: true, // IMPORTANT: Push enabled
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Test transaction notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
