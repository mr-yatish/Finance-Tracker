/**
 * Trigger real-time notification update via Server-Sent Events
 * This sends an event to connected clients when a new notification is created
 */
export function triggerNotificationUpdate(userId: string, notification: any) {
    try {
        // Access global notification streams
        if (typeof globalThis !== "undefined" && globalThis.notificationStreams) {
            const controller = globalThis.notificationStreams.get(userId);

            if (controller) {
                const encoder = new TextEncoder();
                const data = JSON.stringify({
                    type: "notification",
                    notification: {
                        id: notification._id?.toString() || notification.id,
                        title: notification.title,
                        message: notification.message,
                        type: notification.type,
                        isRead: notification.isRead,
                        createdAt: notification.createdAt,
                    },
                });

                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                console.log(`📡 SSE notification sent to user: ${userId}`);
            } else {
                console.log(`⚠️ No active SSE connection for user: ${userId}`);
            }
        }
    } catch (error) {
        console.error("Error triggering notification update:", error);
    }
}

// TypeScript global declaration
declare global {
    var notificationStreams: Map<string, ReadableStreamDefaultController> | undefined;
}
