"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import UserDevice from "@/lib/database/models/user-device.model";
import Notification from "@/lib/database/models/notification.model";
import NotificationPreference from "@/lib/database/models/notification-preference.model";
import User from "@/lib/database/models/user.model";
import { sendPushNotification, sendBatchPushNotification } from "@/lib/firebase/firebase-admin";
import { revalidatePath } from "next/cache";
import { triggerNotificationUpdate } from "@/lib/utils/notification-stream";

// ============================================
// DEVICE TOKEN MANAGEMENT
// ============================================

/**
 * Save or update a user's FCM device token
 */
export async function saveDeviceToken(
    clerkId: string,
    fcmToken: string,
    deviceInfo: {
        browser: string;
        os: string;
        deviceType: string;
        userAgent: string;
    }
) {
    try {
        await connectToDatabase();

        // Get user by clerkId
        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Check if token already exists
        const existingDevice = await UserDevice.findOne({
            userId: user._id,
            fcmToken,
        });

        if (existingDevice) {
            // Update last used timestamp
            existingDevice.lastUsed = new Date();
            existingDevice.isActive = true;
            existingDevice.deviceInfo = deviceInfo;
            await existingDevice.save();

            return {
                success: true,
                message: "Device token updated",
                deviceId: existingDevice._id.toString(),
            };
        }

        // Create new device record
        const newDevice = await UserDevice.create({
            userId: user._id,
            fcmToken,
            deviceInfo,
            isActive: true,
            lastUsed: new Date(),
        });

        return {
            success: true,
            message: "Device token saved",
            deviceId: newDevice._id.toString(),
        };
    } catch (error: any) {
        console.error("Error saving device token:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove a specific device token
 */
export async function removeDeviceToken(clerkId: string, fcmToken: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        await UserDevice.deleteOne({
            userId: user._id,
            fcmToken,
        });

        return { success: true, message: "Device token removed" };
    } catch (error: any) {
        console.error("Error removing device token:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark invalid tokens as inactive
 */
export async function markTokenAsInactive(fcmToken: string) {
    try {
        await connectToDatabase();

        await UserDevice.updateOne(
            { fcmToken },
            { isActive: false }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error marking token as inactive:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all active devices for a user
 */
export async function getUserDevices(clerkId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const devices = await UserDevice.find({
            userId: user._id,
            isActive: true,
        }).sort({ lastUsed: -1 });

        return {
            success: true,
            devices: devices.map((d) => ({
                id: d._id.toString(),
                deviceInfo: d.deviceInfo,
                lastUsed: d.lastUsed,
            })),
        };
    } catch (error: any) {
        console.error("Error getting user devices:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(clerkId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        let preferences = await NotificationPreference.findOne({ userId: user._id });

        // Create default preferences if they don't exist
        if (!preferences) {
            preferences = await NotificationPreference.create({
                userId: user._id,
            });
        }

        return {
            success: true,
            preferences: JSON.parse(JSON.stringify(preferences)),
        };
    } catch (error: any) {
        console.error("Error getting notification preferences:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
    clerkId: string,
    updates: Partial<{
        pushEnabled: boolean;
        inAppEnabled: boolean;
        categories: any;
        quietHours: any;
    }>
) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const preferences = await NotificationPreference.findOneAndUpdate(
            { userId: user._id },
            { $set: updates },
            { new: true, upsert: true }
        );

        revalidatePath("/user-profile");

        return {
            success: true,
            message: "Preferences updated",
            preferences: JSON.parse(JSON.stringify(preferences)),
        };
    } catch (error: any) {
        console.error("Error updating notification preferences:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update permission status
 */
export async function updatePermissionStatus(
    clerkId: string,
    status: "granted" | "denied" | "dismissed"
) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        await NotificationPreference.findOneAndUpdate(
            { userId: user._id },
            {
                $set: {
                    permissionStatus: status,
                    permissionAskedAt: new Date(),
                },
            },
            { upsert: true }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error updating permission status:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// NOTIFICATION CREATION & RETRIEVAL
// ============================================

/**
 * Create a notification (in-app + optionally push)
 */
export async function createNotification(
    clerkId: string,
    notificationData: {
        title: string;
        message: string;
        type: "transaction" | "emi" | "budget" | "bank" | "alert" | "reminder";
        category?: string;
        data?: any;
        actionUrl?: string;
        icon?: string;
        sendPush?: boolean;
    }
) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Get user preferences
        const preferences = await NotificationPreference.findOne({ userId: user._id });

        // Check if in-app notifications are enabled
        const inAppEnabled = preferences?.inAppEnabled !== false &&
            preferences?.categories?.[notificationData.type]?.inAppEnabled !== false;

        if (!inAppEnabled) {
            return { success: false, error: "In-app notifications disabled for this category" };
        }

        // Create in-app notification
        const notification = await Notification.create({
            userId: user._id,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            category: notificationData.category || notificationData.type,
            data: notificationData.data || {},
            actionUrl: notificationData.actionUrl,
            icon: notificationData.icon || "/icons/notification-icon.png",
            isRead: false,
            deliveryLog: {
                inAppCreated: true,
                inAppCreatedAt: new Date(),
            },
        });

        // Send push notification if requested and enabled
        if (notificationData.sendPush) {
            console.log("📱 Push Check: sendPush = true, checking preferences...");

            const pushEnabled = preferences?.pushEnabled !== false &&
                preferences?.categories?.[notificationData.type]?.pushEnabled !== false;

            console.log("📱 Push Check: Global pushEnabled =", preferences?.pushEnabled);
            console.log("📱 Push Check: Category pushEnabled =", preferences?.categories?.[notificationData.type]?.pushEnabled);
            console.log("📱 Push Check: Final pushEnabled =", pushEnabled);

            if (pushEnabled) {
                // Get active devices
                const devices = await UserDevice.find({
                    userId: user._id,
                    isActive: true,
                });

                console.log("📱 Push Check: Found", devices.length, "active device(s)");

                if (devices.length > 0) {
                    const tokens = devices.map((d) => d.fcmToken);
                    console.log("📱 Push Check: Tokens:", tokens.map(t => t.substring(0, 20) + "..."));

                    // Send push notification
                    console.log("📱 Push Check: Calling sendBatchPushNotification...");
                    const pushResult = await sendBatchPushNotification(tokens, {
                        title: notificationData.title,
                        body: notificationData.message,
                        icon: notificationData.icon,
                        data: {
                            notificationId: notification._id.toString(),
                            actionUrl: notificationData.actionUrl || "/dashboard",
                            type: notificationData.type,
                        },
                    });

                    console.log("📱 Push Result:", JSON.stringify(pushResult, null, 2));

                    // Update notification with delivery status
                    if (pushResult.success && pushResult.results) {
                        notification.deliveryLog.pushSent = true;
                        notification.deliveryLog.pushSentAt = new Date();
                        notification.deliveryLog.pushDelivered = pushResult.results.successCount > 0;

                        console.log("✅ Push Delivered:", pushResult.results.successCount, "success,", pushResult.results.failureCount, "failed");

                        // Mark invalid tokens as inactive
                        if (pushResult.results.invalidTokens && pushResult.results.invalidTokens.length > 0) {
                            console.log("⚠️ Marking", pushResult.results.invalidTokens.length, "invalid tokens as inactive");
                            await UserDevice.updateMany(
                                { fcmToken: { $in: pushResult.results.invalidTokens } },
                                { isActive: false }
                            );
                        }
                    } else {
                        notification.deliveryLog.pushError = pushResult.message || "Failed to send";
                        console.error("❌ Push Failed:", pushResult.message);
                    }

                    await notification.save();
                } else {
                    console.log("⚠️ Push Check: No devices found - push not sent");
                }
            } else {
                console.log("⚠️ Push Check: Push disabled in preferences - not sending");
            }
        } else {
            console.log("⚠️ Push Check: sendPush = false - skipping push notification");
        }

        revalidatePath("/dashboard");

        // Trigger real-time update via SSE
        triggerNotificationUpdate(clerkId, notification);

        return {
            success: true,
            message: "Notification created",
            notificationId: notification._id.toString(),
        };
    } catch (error: any) {
        console.error("Error creating notification:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user notifications with pagination
 */
export async function getUserNotifications(
    clerkId: string,
    options: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
        type?: string;
    } = {}
) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        // Build query
        const query: any = {
            userId: user._id,
            isDeleted: false,
        };

        if (options.unreadOnly) {
            query.isRead = false;
        }

        if (options.type) {
            query.type = options.type;
        }

        // Get notifications
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count
        const totalCount = await Notification.countDocuments(query);

        // Get unread count
        const unreadCount = await Notification.countDocuments({
            userId: user._id,
            isRead: false,
            isDeleted: false,
        });

        return {
            success: true,
            notifications: JSON.parse(JSON.stringify(notifications)),
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
            unreadCount,
        };
    } catch (error: any) {
        console.error("Error getting notifications:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(clerkId: string, notificationId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        await Notification.updateOne(
            {
                _id: notificationId,
                userId: user._id,
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            }
        );

        revalidatePath("/dashboard");

        return { success: true, message: "Notification marked as read" };
    } catch (error: any) {
        console.error("Error marking notification as read:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(clerkId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        await Notification.updateMany(
            {
                userId: user._id,
                isRead: false,
                isDeleted: false,
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            }
        );

        revalidatePath("/dashboard");

        return { success: true, message: "All notifications marked as read" };
    } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete notification (soft delete)
 */
export async function deleteNotification(clerkId: string, notificationId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        await Notification.updateOne(
            {
                _id: notificationId,
                userId: user._id,
            },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            }
        );

        revalidatePath("/dashboard");

        return { success: true, message: "Notification deleted" };
    } catch (error: any) {
        console.error("Error deleting notification:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN / BULK OPERATIONS
// ============================================

/**
 * Send notification to multiple users (admin use)
 */
export async function sendBulkNotification(
    userClerkIds: string[],
    notificationData: {
        title: string;
        message: string;
        type: "transaction" | "emi" | "budget" | "bank" | "alert" | "reminder";
        category?: string;
        data?: any;
        actionUrl?: string;
        icon?: string;
        sendPush?: boolean;
    }
) {
    try {
        await connectToDatabase();

        const results = {
            success: 0,
            failed: 0,
            errors: [] as any[],
        };

        for (const clerkId of userClerkIds) {
            const result = await createNotification(clerkId, notificationData);
            if (result.success) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push({ clerkId, error: result.error });
            }
        }

        return {
            success: true,
            results,
        };
    } catch (error: any) {
        console.error("Error sending bulk notification:", error);
        return { success: false, error: error.message };
    }
}
