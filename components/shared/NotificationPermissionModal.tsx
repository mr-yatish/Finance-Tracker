"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { requestNotificationPermission, getDeviceInfo } from "@/lib/firebase/firebase-client";
import { saveDeviceToken, updatePermissionStatus } from "@/lib/actions/notification.actions";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface NotificationPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationPermissionModal({
    isOpen,
    onClose,
}: NotificationPermissionModalProps) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handleEnableNotifications = async () => {
        if (!user) {
            toast.error("Please sign in to enable notifications");
            return;
        }

        setIsLoading(true);

        try {
            // Request browser permission and get FCM token
            const fcmToken = await requestNotificationPermission();

            if (fcmToken) {
                // Get device information
                const deviceInfo = getDeviceInfo();

                // Save token to database
                const result = await saveDeviceToken(
                    user.id,
                    fcmToken,
                    deviceInfo
                );

                if (result.success) {
                    // Update permission status
                    await updatePermissionStatus(user.id, "granted");

                    toast.success("Notifications enabled successfully!");
                    onClose();
                } else {
                    toast.error("Failed to save notification settings");
                }
            } else {
                // Permission denied or dismissed
                await updatePermissionStatus(user.id, "denied");
                toast.error("Notification permission denied. You can enable it later in browser settings.");
                onClose();
            }
        } catch (error) {
            console.error("Error enabling notifications:", error);
            toast.error("Failed to enable notifications. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotNow = async () => {
        if (user) {
            await updatePermissionStatus(user.id, "dismissed");
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Bell className="h-6 w-6 text-primary" />
                            Enable Notifications
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base pt-2">
                        Stay on top of your finances with timely notifications!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Why Notifications */}
                    <div>
                        <h4 className="font-semibold mb-2 text-sm">
                            📬 What you&apos;ll receive:
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">💰</span>
                                <span>Transaction updates when you add or modify expenses</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">📅</span>
                                <span>EMI payment reminders so you never miss a deadline</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">📉</span>
                                <span>Budget alerts when you&apos;re approaching your limits</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">🏦</span>
                                <span>Important account changes and system updates</span>
                            </li>
                        </ul>
                    </div>

                    {/* Privacy Note */}
                    <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-xs text-muted-foreground">
                            🔒 <strong>Your privacy matters:</strong> We&apos;ll only send relevant financial
                            notifications. You can customize which notifications you receive or
                            disable them anytime from your profile settings.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleNotNow}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Not Now
                    </Button>
                    <Button
                        type="button"
                        onClick={handleEnableNotifications}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <span className="mr-2">Enabling...</span>
                                <span className="animate-spin">⏳</span>
                            </>
                        ) : (
                            <>
                                <Bell className="mr-2 h-4 w-4" />
                                Enable Notifications
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
