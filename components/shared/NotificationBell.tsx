"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/lib/actions/notification.actions";
// import { ScrollArea } from "@/components/ui/scroll-area"; // TODO: Install @radix-ui/react-scroll-area
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import NotificationPermissionModal from "./NotificationPermissionModal";
import { getNotificationPreferences } from "@/lib/actions/notification.actions";
import { onForegroundMessage } from "@/lib/firebase/firebase-client";

export default function NotificationBell() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user) return;

        setIsLoading(true);
        const result = await getUserNotifications(user.id, {
            page: 1,
            limit: 10,
        });

        if (result.success) {
            setNotifications(result.notifications || []);
            setUnreadCount(result.unreadCount || 0);
        }
        setIsLoading(false);
    };

    // Check if we should show permission modal
    const checkPermissionStatus = async () => {
        if (!user) return;

        const result = await getNotificationPreferences(user.id);
        if (result.success) {
            const { permissionStatus } = result.preferences;

            // Show modal if permission not asked yet
            if (permissionStatus === "not_asked") {
                // Wait 3 seconds after page load, then show modal
                setTimeout(() => {
                    setShowPermissionModal(true);
                }, 3000);
            }
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchNotifications();
        checkPermissionStatus();

        // Set up Server-Sent Events for real-time updates
        const eventSource = new EventSource('/api/notifications/stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📡 SSE Event received:', data);

            if (data.type === 'notification') {
                // New notification received - refresh immediately
                console.log('🔔 New notification via SSE!', data.notification);
                fetchNotifications();
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
        };

        // Set up Firebase foreground message listener
        const unsubscribe = onForegroundMessage((payload) => {
            console.log("🔥 Firebase foreground message:", payload);
            // Refresh notifications
            fetchNotifications();
        });

        return () => {
            eventSource.close();
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleMarkAsRead = async (notificationId: string) => {
        if (!user) return;

        const result = await markNotificationAsRead(user.id, notificationId);
        if (result.success) {
            // Update local state
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;

        const result = await markAllNotificationsAsRead(user.id);
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        }
    };

    const getNotificationIcon = (type: string) => {
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
    };

    if (!user) return null;

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div>
                            <h3 className="font-semibold text-lg">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {unreadCount} unread
                                </p>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 p-4">
                                <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground text-center">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.isRead ? "bg-muted/30" : ""
                                            }`}
                                        onClick={() => {
                                            if (!notification.isRead) {
                                                handleMarkAsRead(notification._id);
                                            }
                                            if (notification.actionUrl) {
                                                setIsOpen(false);
                                            }
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-medium text-sm line-clamp-1">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t">
                            <Link href="/notifications" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" size="sm" className="w-full">
                                    View all notifications
                                </Button>
                            </Link>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Permission Modal */}
            <NotificationPermissionModal
                isOpen={showPermissionModal}
                onClose={() => setShowPermissionModal(false)}
            />
        </>
    );
}
