import NotificationDiagnostics from "@/components/shared/NotificationDiagnostics";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotificationDebugPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <NotificationDiagnostics />

            <div className="mt-8 max-w-2xl mx-auto space-y-4">
                <h2 className="text-xl font-semibold">Common Issues & Solutions</h2>

                <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🚫 Permission Denied</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            If notification permission is denied, you need to reset it in your browser settings.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            <strong>Chrome:</strong> Click the lock icon in address bar → Site settings → Notifications → Allow
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">⚙️ Service Worker Not Registered</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            The service worker should register automatically. Try:
                        </p>
                        <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                            <li>Hard refresh the page (Ctrl/Cmd + Shift + R)</li>
                            <li>Check DevTools → Application → Service Workers</li>
                            <li>Click "Unregister" if you see an old worker, then refresh</li>
                        </ol>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔥 Firebase Cloud Messaging Not Enabled</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            If push notifications fail to send, the Cloud Messaging API might not be enabled:
                        </p>
                        <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                            <li>Go to Firebase Console → Project Settings</li>
                            <li>Navigate to Cloud Messaging tab</li>
                            <li>Enable Cloud Messaging API if prompted</li>
                        </ol>
                        <a
                            href="https://console.firebase.google.com/project/finance-tracker-84e41/settings/cloudmessaging"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                            Open Firebase Cloud Messaging Settings →
                        </a>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">📡 SSE Connection Failed</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            If Server-Sent Events aren't working:
                        </p>
                        <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                            <li>Make sure you're logged in</li>
                            <li>Check browser console for errors</li>
                            <li>Try refreshing the page</li>
                        </ol>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-semibold mb-2">💡 Testing Notifications</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                        You can test notifications using these API endpoints:
                    </p>
                    <div className="space-y-2 mt-3">
                        <code className="block p-2 bg-white dark:bg-black rounded text-xs">
                            POST /api/test-notification - Test in-app notification
                        </code>
                        <code className="block p-2 bg-white dark:bg-black rounded text-xs">
                            POST /api/test-push - Test push notification
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
}
