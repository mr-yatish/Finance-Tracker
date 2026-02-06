import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserNotifications } from "@/lib/actions/notification.actions";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await getUserNotifications(userId, {
            page: 1,
            limit: 20,
        });

        return NextResponse.json({
            ...result,
            userId,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Check notifications error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
