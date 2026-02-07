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

        // Track recently shown notifications to prevent duplicates
        const shownNotifications = new Set<string>();

        // Clear old entries after 10 seconds
        const clearOldEntries = () => {
            shownNotifications.clear();
        };
        const cleanupInterval = setInterval(clearOldEntries, 10000);

        // Set up Server-Sent Events for real-time updates
        const eventSource = new EventSource('/api/notifications/stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📡 SSE Event received (Toast):', data);

            if (data.type === 'notification' && data.notification) {
                const notification = data.notification;
                const notifId = notification.id || notification._id;

                // CHECK: Skip if already shown
                if (shownNotifications.has(notifId)) {
                    console.log('⏭️ Skipping duplicate toast for:', notifId);
                    return;
                }

                // Mark as shown
                shownNotifications.add(notifId);

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
        // NOTE: We only log Firebase messages, SSE handles the toast
        const unsubscribe = onForegroundMessage((payload) => {
            console.log("🔥 Firebase foreground message (Toast):", payload);

            // Get notification ID from Firebase payload
            const notifId = payload.data?.notificationId;

            // If SSE already showed this, skip
            if (notifId && shownNotifications.has(notifId)) {
                console.log('⏭️ SSE already showed this notification, skipping Firebase toast');
                return;
            }

            // If SSE didn't show it (edge case), show it from Firebase
            if (notifId) {
                shownNotifications.add(notifId);
            }

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
            clearInterval(cleanupInterval);
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
