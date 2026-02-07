"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

export default function NotificationDiagnostics() {
    const [diagnostics, setDiagnostics] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const results: any = {
            browserPermission: "unknown",
            serviceWorker: "unknown",
            firebaseInit: "unknown",
            vapidKey: "unknown",
            apiConnection: "unknown",
            sseConnection: "unknown",
            fcmToken: null,
            errors: [],
        };

        try {
            // 1. Check browser notification permission
            if ("Notification" in window) {
                results.browserPermission = Notification.permission;
            } else {
                results.browserPermission = "not_supported";
                results.errors.push("Browser doesn't support notifications");
            }

            // 2. Check service worker
            if ("serviceWorker" in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                const swReg = registrations.find(reg =>
                    reg.active?.scriptURL.includes("firebase-messaging-sw")
                );

                if (swReg && swReg.active) {
                    results.serviceWorker = swReg.active.state;
                } else {
                    results.serviceWorker = "not_registered";
                    results.errors.push("Firebase service worker not registered");
                }
            } else {
                results.serviceWorker = "not_supported";
                results.errors.push("Browser doesn't support service workers");
            }

            // 3. Check Firebase initialization
            try {
                const { initializeFirebase, initializeMessaging } = await import("@/lib/firebase/firebase-client");
                const app = initializeFirebase();
                if (app) {
                    results.firebaseInit = "success";

                    const messaging = initializeMessaging();
                    if (messaging) {
                        results.firebaseMessaging = "success";
                    } else {
                        results.firebaseMessaging = "failed";
                        results.errors.push("Firebase messaging initialization failed");
                    }
                } else {
                    results.firebaseInit = "failed";
                    results.errors.push("Firebase app initialization failed");
                }
            } catch (error: any) {
                results.firebaseInit = "error";
                results.errors.push(`Firebase error: ${error.message}`);
            }

            // 4. Check VAPID key
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (vapidKey && vapidKey.length > 50) {
                results.vapidKey = "configured";
            } else {
                results.vapidKey = "missing";
                results.errors.push("VAPID key not configured or invalid");
            }

            // 5. Try to get FCM token (if permission granted)
            if (results.browserPermission === "granted") {
                try {
                    const { requestNotificationPermission } = await import("@/lib/firebase/firebase-client");
                    const token = await requestNotificationPermission();
                    if (token) {
                        results.fcmToken = token.substring(0, 20) + "...";
                    } else {
                        results.errors.push("Could not get FCM token");
                    }
                } catch (error: any) {
                    results.errors.push(`FCM token error: ${error.message}`);
                }
            }

            // 6. Check API connectivity
            try {
                const response = await fetch('/api/notifications/stream', {
                    method: 'HEAD',
                });
                if (response.ok || response.status === 405) {
                    results.apiConnection = "success";
                } else {
                    results.apiConnection = "failed";
                    results.errors.push(`API returned status: ${response.status}`);
                }
            } catch (error: any) {
                results.apiConnection = "error";
                results.errors.push(`API error: ${error.message}`);
            }

            // 7. Test SSE connection
            try {
                const testSSE = new Promise((resolve, reject) => {
                    const es = new EventSource('/api/notifications/stream');
                    const timeout = setTimeout(() => {
                        es.close();
                        reject(new Error("SSE connection timeout"));
                    }, 5000);

                    es.onopen = () => {
                        clearTimeout(timeout);
                        es.close();
                        resolve("connected");
                    };

                    es.onerror = (error) => {
                        clearTimeout(timeout);
                        es.close();
                        reject(error);
                    };
                });

                await testSSE;
                results.sseConnection = "success";
            } catch (error: any) {
                results.sseConnection = "failed";
                results.errors.push(`SSE error: ${error.message}`);
            }

        } catch (error: any) {
            results.errors.push(`Diagnostic error: ${error.message}`);
        }

        setDiagnostics(results);
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        if (status === "success" || status === "granted" || status === "activated" || status === "configured") {
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        } else if (status === "denied" || status === "failed" || status === "error" || status === "not_registered" || status === "missing") {
            return <XCircle className="h-5 w-5 text-red-500" />;
        } else {
            return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === "success" || status === "granted" || status === "activated" || status === "configured") {
            return <Badge variant="default" className="bg-green-500">{status}</Badge>;
        } else if (status === "denied" || status === "failed" || status === "error" || status === "not_registered" || status === "missing") {
            return <Badge variant="destructive">{status}</Badge>;
        } else {
            return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>🔍 Notification System Diagnostics</CardTitle>
                <CardDescription>
                    Check your notification setup and identify issues
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    onClick={runDiagnostics}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Diagnostics...
                        </>
                    ) : (
                        "Run Diagnostics"
                    )}
                </Button>

                {diagnostics && (
                    <div className="space-y-4 mt-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">System Status</h3>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.browserPermission)}
                                    <span>Browser Permission</span>
                                </div>
                                {getStatusBadge(diagnostics.browserPermission)}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.serviceWorker)}
                                    <span>Service Worker</span>
                                </div>
                                {getStatusBadge(diagnostics.serviceWorker)}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.firebaseInit)}
                                    <span>Firebase Initialization</span>
                                </div>
                                {getStatusBadge(diagnostics.firebaseInit)}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.vapidKey)}
                                    <span>VAPID Key</span>
                                </div>
                                {getStatusBadge(diagnostics.vapidKey)}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.apiConnection)}
                                    <span>API Connection</span>
                                </div>
                                {getStatusBadge(diagnostics.apiConnection)}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.sseConnection)}
                                    <span>SSE Real-time Connection</span>
                                </div>
                                {getStatusBadge(diagnostics.sseConnection)}
                            </div>

                            {diagnostics.fcmToken && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-sm font-medium mb-1">FCM Token</div>
                                    <code className="text-xs break-all">{diagnostics.fcmToken}</code>
                                </div>
                            )}
                        </div>

                        {diagnostics.errors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-red-500">Issues Found</h3>
                                <div className="space-y-2">
                                    {diagnostics.errors.map((error: string, index: number) => (
                                        <div key={index} className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {diagnostics.errors.length === 0 && diagnostics.browserPermission === "granted" && (
                            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span className="font-medium text-green-700 dark:text-green-300">
                                        ✅ All checks passed! Notifications should be working.
                                    </span>
                                </div>
                            </div>
                        )}

                        {diagnostics.browserPermission !== "granted" && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="text-yellow-700 dark:text-yellow-300">
                                    <strong>Action Required:</strong> Click the notification bell icon and grant permission to enable push notifications.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
