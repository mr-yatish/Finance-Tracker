import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// Server-Sent Events for real-time notification updates
export async function GET(request: Request) {
    const { userId } = await auth();

    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`)
            );

            // Send heartbeat every 30 seconds to keep connection alive
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`)
                    );
                } catch (error) {
                    clearInterval(heartbeat);
                }
            }, 30000);

            // Store the controller globally so we can send updates
            // In production, use Redis/Pub-Sub for multi-instance support
            if (typeof globalThis !== "undefined") {
                if (!globalThis.notificationStreams) {
                    globalThis.notificationStreams = new Map();
                }
                globalThis.notificationStreams.set(userId, controller);
            }

            // Cleanup on close
            request.signal.addEventListener("abort", () => {
                clearInterval(heartbeat);
                if (globalThis.notificationStreams) {
                    globalThis.notificationStreams.delete(userId);
                }
                try {
                    controller.close();
                } catch (e) {
                    // Already closed
                }
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
