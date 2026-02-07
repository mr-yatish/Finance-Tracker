"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { onForegroundMessage } from "@/lib/firebase/firebase-client";

/**
 * Global notification toast handler
 * Shows toast notifications in top-right when new notifications arrive
 */
export default function NotificationToast() {
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;

        // Set up Server-Sent Events for real-time updates
        const eventSource = new EventSource('/api/notifications/stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📡 SSE Event received (Toast):', data);

            if (data.type === 'notification' && data.notification) {
                const notification = data.notification;
                
                // Show toast notification in top-right
                toast(notification.title, {
                    description: notification.message,
                    icon: getNotificationIcon(notification.type),
                    duration: 5000,
                    position: "top-right",
                    action: notification.actionUrl ? {
                        label: "View",
                        onClick: () => {
                            window.location.href = notification.actionUrl;
                        }
                    } : undefined,
                });
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error (Toast):', error);
            eventSource.close();
        };

        // Set up Firebase foreground message listener
        const unsubscribe = onForegroundMessage((payload) => {
            console.log("🔥 Firebase foreground message (Toast):", payload);
            
            // Show toast for foreground push notifications
            const title = payload.notification?.title || 'New Notification';
            const body = payload.notification?.body || '';
            
            toast(title, {
                description: body,
                icon: "🔔",
                duration: 5000,
                position: "top-right",
                action: payload.data?.actionUrl ? {
                    label: "View",
                    onClick: () => {
                        window.location.href = payload.data.actionUrl;
                    }
                } : undefined,
            });
        });

        return () => {
            eventSource.close();
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return null; // This component doesn't render anything
}

// Helper function to get emoji icons for different notification types
function getNotificationIcon(type: string): string {
    switch (type) {
        case "transaction":
            return "💰";
        case "emi":
            return "📅";
        case "budget":
            return "📉";
        case "bank":
            return "🏦";
        case "alert":
            return "⚠️";
        case "reminder":
            return "🔔";
        default:
            return "📬";
    }
}
