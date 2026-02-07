"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NotificationTestPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const testFetchNotifications = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/notifications?limit=5');
            const data = await response.json();
            setResult(data);

            if (data.success) {
                toast.success(`Found ${data.notifications?.length || 0} notifications`);
            } else {
                toast.error(data.error || "Failed to fetch notifications");
            }
        } catch (error: any) {
            toast.error(error.message);
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const testCreateNotification = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/test-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: '🧪 Test Notification',
                    message: 'This is a test notification to check the bell icon',
                    type: 'alert'
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Notification created! Check the bell icon.");
                // Refresh the notifications list
                setTimeout(testFetchNotifications, 1000);
            } else {
                toast.error(data.error || "Failed to create notification");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkSSEConnection = () => {
        const es = new EventSource('/api/notifications/stream');

        es.onopen = () => {
            toast.success("SSE connected!");
            console.log("✅ SSE connection opened");
        };

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📡 SSE message:", data);

            if (data.type === 'connected') {
                toast.info("SSE: " + data.message);
            } else if (data.type === 'notification') {
                toast.success("New notification via SSE!");
            }
        };

        es.onerror = (error) => {
            console.error("❌ SSE error:", error);
            toast.error("SSE connection failed");
            es.close();
        };

        toast.info("SSE connection initiated... check console");

        // Close after 10 seconds for this test
        setTimeout(() => {
            es.close();
            toast.info("SSE test connection closed");
        }, 10000);
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>🔔 Notification Bell Debug Tool</CardTitle>
                    <CardDescription>
                        Test notification fetching, creation, and SSE connections
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <Button
                            onClick={testFetchNotifications}
                            disabled={loading}
                            variant="outline"
                            className="w-full"
                        >
                            1. Fetch My Notifications
                        </Button>

                        <Button
                            onClick={testCreateNotification}
                            disabled={loading}
                            className="w-full"
                        >
                            2. Create Test Notification
                        </Button>

                        <Button
                            onClick={checkSSEConnection}
                            variant="secondary"
                            className="w-full"
                        >
                            3. Test SSE Connection (10s)
                        </Button>
                    </div>

                    {result && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Result:</h3>
                            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                                {JSON.stringify(result, null, 2)}
                            </pre>

                            {result.success && result.notifications && (
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">
                                        Notifications ({result.notifications.length}):
                                    </h4>
                                    {result.notifications.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">
                                            No notifications found. Try creating one using button #2 above.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {result.notifications.map((notif: any, index: number) => (
                                                <Card key={index}>
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-medium text-sm">{notif.title}</p>
                                                                <p className="text-xs text-muted-foreground">{notif.message}</p>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded ${notif.isRead ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                                                {notif.isRead ? 'Read' : 'Unread'}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    {result.unreadCount !== undefined && (
                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                            <p className="text-sm">
                                                <strong>Unread Count:</strong> {result.unreadCount}
                                                {result.unreadCount > 0 && (
                                                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                                        (This should show in the bell badge!)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm">Troubleshooting Steps:</h4>
                        <ol className="text-xs space-y-1 text-muted-foreground list-decimal list-inside">
                            <li>Click "Fetch My Notifications" - See if you have any notifications</li>
                            <li>Click "Create Test Notification" - This should create one</li>
                            <li>Check the bell icon in the header - Badge should update</li>
                            <li>Click "Test SSE Connection" - Check console for SSE events</li>
                            <li>Look at browser console (F12) for any errors</li>
                        </ol>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm">Common Issues:</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                            <li><strong>401 Unauthorized:</strong> You're not logged in</li>
                            <li><strong>No notifications found:</strong> Create a test one using button #2</li>
                            <li><strong>SSE fails:</strong> Check if /api/notifications/stream exists</li>
                            <li><strong>Bell not updating:</strong> Check NotificationBell component is rendering</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
