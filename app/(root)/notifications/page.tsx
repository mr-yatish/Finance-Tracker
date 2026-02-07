"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "@/lib/actions/notification.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;

        setLoading(true);
        const result = await getUserNotifications(user.id, {
            page: 1,
            limit: 50,
            unreadOnly: filter === "unread",
        });

        if (result.success) {
            setNotifications(result.notifications || []);
            setUnreadCount(result.unreadCount || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filter]);

    const handleMarkAsRead = async (notificationId: string) => {
        if (!user) return;

        const result = await markNotificationAsRead(user.id, notificationId);
        if (result.success) {
            toast.success("Marked as read");
            fetchNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;

        const result = await markAllNotificationsAsRead(user.id);
        if (result.success) {
            toast.success("All notifications marked as read");
            fetchNotifications();
        }
    };

    const handleDelete = async (notificationId: string) => {
        if (!user) return;

        const result = await deleteNotification(user.id, notificationId);
        if (result.success) {
            toast.success("Notification deleted");
            fetchNotifications();
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

    const formatTime = (date: string) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Please log in to view notifications</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2">
                                <Bell className="h-6 w-6" />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                {unreadCount > 0 && `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
                            </CardDescription>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="all">
                                All ({notifications.length})
                            </TabsTrigger>
                            <TabsTrigger value="unread">
                                Unread ({unreadCount})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={filter} className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`border rounded-lg p-4 transition-colors ${!notification.isRead
                                                    ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                                                    : "bg-card hover:bg-muted"
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Icon */}
                                                <div className="text-2xl shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-sm">
                                                                    {notification.title}
                                                                </h4>
                                                                {!notification.isRead && (
                                                                    <div className="h-2 w-2 bg-primary rounded-full shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatTime(notification.createdAt)}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {notification.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleMarkAsRead(notification._id)}
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(notification._id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    {notification.actionUrl && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs"
                                                            onClick={() => {
                                                                handleMarkAsRead(notification._id);
                                                                window.location.href = notification.actionUrl;
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
