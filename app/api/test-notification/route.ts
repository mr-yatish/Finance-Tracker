import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/actions/notification.actions";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const result = await createNotification(userId, {
            title: body.title || "Test Notification",
            message: body.message || "This is a test",
            type: body.type || "alert",
            sendPush: true,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Test notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
