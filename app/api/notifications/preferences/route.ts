import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getNotificationPreferences } from "@/lib/actions/notification.actions";

/**
 * GET notification preferences for debugging
 */
export async function GET() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await getNotificationPreferences(user.id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            preferences: result.preferences,
        });
    } catch (error: any) {
        console.error("Error in GET /api/notifications/preferences:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
