"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function PushDebugPage() {
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const checkPushSetup = async () => {
        setLoading(true);
        const info: any = {
            browser: {},
            preferences: null,
            devices: null,
            testResult: null
        };

        try {
            // 1. Check browser support
            info.browser.supported = 'Notification' in window;
            info.browser.permission = Notification.permission;
            info.browser.serviceWorker = 'serviceWorker' in navigator;

            // 2. Fetch user preferences
            try {
                const prefResp = await fetch('/api/notifications/preferences');
                if (prefResp.ok) {
                    const prefData = await prefResp.json();
                    info.preferences = prefData.preferences;
                }
            } catch (e: any) {
                info.preferences = { error: e.message };
            }

            // 3. Fetch user devices
            try {
                const devResp = await fetch('/api/notifications/devices');
                if (devResp.ok) {
                    const devData = await devResp.json();
                    info.devices = devData.devices;
                }
            } catch (e: any) {
                info.devices = { error: e.message };
            }

            // 4. Test creating a transaction notification
            try {
                const testResp = await fetch('/api/test-transaction-notification', {
                    method: 'POST'
                });
                const testData = await testResp.json();
                info.testResult = testData;
            } catch (e: any) {
                info.testResult = { error: e.message };
            }

            setDebugInfo(info);

            // Analyze and provide feedback
            if (info.browser.permission !== 'granted') {
                toast.error("Permission not granted!", {
                    description: "Click bell icon and grant permission first"
                });
            } else if (!info.devices || info.devices.length === 0) {
                toast.warning("No FCM token saved!", {
                    description: "Refresh page and grant permission via bell icon"
                });
            } else if (info.preferences?.categories?.transaction?.pushEnabled === false) {
                toast.error("Transaction push disabled in preferences!");
            } else if (!info.preferences?.pushEnabled) {
                toast.error("Push notifications disabled in preferences!");
            } else {
                toast.success("Setup looks good!", {
                    description: "Check test result below"
                });
            }
        } catch (error: any) {
            toast.error("Error checking setup", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (condition: boolean, text: string) => {
        return condition ?
            <Badge variant="default" className="bg-green-600">{text}</Badge> :
            <Badge variant="destructive">{text}</Badge>;
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>🔍 Transaction Push Notification Debug</CardTitle>
                    <CardDescription>
                        Diagnose why transaction push notifications aren't working
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={checkPushSetup}
                        disabled={loading}
                        size="lg"
                        className="w-full"
                    >
                        {loading ? "Checking..." : "🔍 Run Full Diagnostic"}
                    </Button>

                    {debugInfo && (
                        <div className="space-y-6 mt-6">
                            {/* Browser Support */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">1. Browser Support</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Notifications API:</span>
                                        {getStatusBadge(debugInfo.browser.supported,
                                            debugInfo.browser.supported ? "✅ Supported" : "❌ Not Supported")}
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Permission Status:</span>
                                        {getStatusBadge(debugInfo.browser.permission === 'granted',
                                            debugInfo.browser.permission)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Service Worker:</span>
                                        {getStatusBadge(debugInfo.browser.serviceWorker,
                                            debugInfo.browser.serviceWorker ? "✅ Available" : "❌ Not Available")}
                                    </div>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">2. Notification Preferences</h3>
                                {debugInfo.preferences?.error ? (
                                    <p className="text-red-600 text-sm">{debugInfo.preferences.error}</p>
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Global Push Enabled:</span>
                                            {getStatusBadge(debugInfo.preferences?.pushEnabled !== false,
                                                debugInfo.preferences?.pushEnabled !== false ? "✅ Yes" : "❌ No")}
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Transaction Push Enabled:</span>
                                            {getStatusBadge(
                                                debugInfo.preferences?.categories?.transaction?.pushEnabled !== false,
                                                debugInfo.preferences?.categories?.transaction?.pushEnabled !== false ? "✅ Yes" : "❌ No"
                                            )}
                                        </div>
                                        <div className="flex justify-between">
                                            <span>In-App Enabled:</span>
                                            {getStatusBadge(debugInfo.preferences?.inAppEnabled !== false,
                                                debugInfo.preferences?.inAppEnabled !== false ? "✅ Yes" : "❌ No")}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Devices */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">3. Registered Devices (FCM Tokens)</h3>
                                {debugInfo.devices?.error ? (
                                    <p className="text-red-600 text-sm">{debugInfo.devices.error}</p>
                                ) : Array.isArray(debugInfo.devices) && debugInfo.devices.length > 0 ? (
                                    <div className="space-y-2">
                                        <Badge variant="default" className="bg-green-600">
                                            ✅ {debugInfo.devices.length} device(s) registered
                                        </Badge>
                                        {debugInfo.devices.map((device: any, i: number) => (
                                            <div key={i} className="text-xs bg-muted p-2 rounded">
                                                <p><strong>Device:</strong> {device.deviceInfo?.browser || 'Unknown'} on {device.deviceInfo?.os || 'Unknown'}</p>
                                                <p><strong>Last Used:</strong> {new Date(device.lastUsed).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Badge variant="destructive">❌ No devices registered</Badge>
                                )}
                            </div>

                            {/* Test Result */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">4. Test Transaction Notification</h3>
                                {debugInfo.testResult ? (
                                    <div className="space-y-2">
                                        {debugInfo.testResult.success ? (
                                            <>
                                                <Badge variant="default" className="bg-green-600">✅ Notification Created</Badge>
                                                <div className="text-xs bg-muted p-3 rounded mt-2">
                                                    <pre>{JSON.stringify(debugInfo.testResult, null, 2)}</pre>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Badge variant="destructive">❌ Failed</Badge>
                                                <p className="text-sm text-red-600 mt-2">{debugInfo.testResult.error}</p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No test result</p>
                                )}
                            </div>

                            {/* Full Debug JSON */}
                            <details className="border rounded-lg p-4">
                                <summary className="font-semibold cursor-pointer">View Full Debug JSON</summary>
                                <pre className="text-xs bg-muted p-3 rounded mt-3 overflow-auto max-h-96">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </details>

                            {/* Recommendations */}
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">💡 Recommendations</h3>
                                <ul className="text-sm space-y-1 list-disc list-inside">
                                    {debugInfo.browser.permission !== 'granted' && (
                                        <li className="text-red-600">Grant notification permission via browser/bell icon</li>
                                    )}
                                    {(!debugInfo.devices || debugInfo.devices.length === 0) && (
                                        <li className="text-red-600">No FCM token saved - Refresh page and click bell icon to register</li>
                                    )}
                                    {debugInfo.preferences?.pushEnabled === false && (
                                        <li className="text-red-600">Enable push notifications in preferences</li>
                                    )}
                                    {debugInfo.preferences?.categories?.transaction?.pushEnabled === false && (
                                        <li className="text-red-600">Enable transaction push in category preferences</li>
                                    )}
                                    {debugInfo.testResult?.success && (
                                        <li className="text-green-600">Everything looks good! Check if you received the test notification</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
