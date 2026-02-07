import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserNotifications } from "@/lib/actions/notification.actions";

/**
 * API endpoint to fetch user notifications
 * GET /api/notifications
 */
export async function GET(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const unreadOnly = searchParams.get("unreadOnly") === "true";
        const type = searchParams.get("type") || undefined;

        const result = await getUserNotifications(user.id, {
            page,
            limit,
            unreadOnly,
            type,
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            notifications: result.notifications,
            pagination: result.pagination,
            unreadCount: result.unreadCount,
        });
    } catch (error: any) {
        console.error("Error in GET /api/notifications:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
