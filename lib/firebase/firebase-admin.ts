import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (singleton pattern)
const initializeFirebaseAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0]; // Already initialized
    }

    try {
        // Get credentials from environment variables
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
            : undefined;

        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (!privateKey || !clientEmail || !projectId) {
            throw new Error("Firebase Admin credentials are missing in environment variables");
        }

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        throw error;
    }
};

// Get Firebase Admin instance
export const getFirebaseAdmin = () => {
    return initializeFirebaseAdmin();
};

// Get Messaging instance
export const getMessagingAdmin = () => {
    const app = getFirebaseAdmin();
    return admin.messaging(app || undefined);
};

// Send push notification to a single device
export const sendPushNotification = async (
    fcmToken: string,
    notification: {
        title: string;
        body: string;
        icon?: string;
        badge?: string;
        data?: Record<string, string>;
    }
) => {
    try {
        const messaging = getMessagingAdmin();

        const message: admin.messaging.Message = {
            token: fcmToken,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data,
            webpush: {
                notification: {
                    icon: notification.icon,
                    badge: notification.badge,
                },
                fcmOptions: {
                    link: notification.data?.actionUrl || "/dashboard",
                },
            },
        };

        const response = await messaging.send(message);
        return { success: true, messageId: response };
    } catch (error: any) {
        console.error("Error sending push notification:", error);

        // Handle specific error codes
        if (error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered") {
            return { success: false, error: "INVALID_TOKEN", message: error.message };
        }

        return { success: false, error: "SEND_FAILED", message: error.message };
    }
};

// Send push notification to multiple devices
export const sendBatchPushNotification = async (
    fcmTokens: string[],
    notification: {
        title: string;
        body: string;
        icon?: string;
        badge?: string;
        data?: Record<string, string>;
    }
) => {
    try {
        const messaging = getMessagingAdmin();

        const message: admin.messaging.MulticastMessage = {
            tokens: fcmTokens,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data,
            webpush: {
                notification: {
                    icon: notification.icon,
                    badge: notification.badge,
                },
                fcmOptions: {
                    link: notification.data?.actionUrl || "/dashboard",
                },
            },
        };

        const response = await messaging.sendEachForMulticast(message);

        // Parse results
        const results = {
            successCount: response.successCount,
            failureCount: response.failureCount,
            invalidTokens: [] as string[],
            errors: [] as any[],
        };

        response.responses.forEach((resp: admin.messaging.SendResponse, idx: number) => {
            if (!resp.success) {
                results.errors.push({
                    token: fcmTokens[idx],
                    error: resp.error?.code,
                    message: resp.error?.message,
                });

                // Track invalid tokens for cleanup
                if (
                    resp.error?.code === "messaging/invalid-registration-token" ||
                    resp.error?.code === "messaging/registration-token-not-registered"
                ) {
                    results.invalidTokens.push(fcmTokens[idx]);
                }
            }
        });

        return { success: true, results };
    } catch (error: any) {
        console.error("Error sending batch push notification:", error);
        return { success: false, error: "BATCH_SEND_FAILED", message: error.message };
    }
};

// Validate FCM token
export const validateFCMToken = async (fcmToken: string): Promise<boolean> => {
    try {
        const messaging = getMessagingAdmin();

        // Try to send a dry-run message
        await messaging.send(
            {
                token: fcmToken,
                notification: {
                    title: "Test",
                    body: "Test",
                },
            },
            true // dryRun = true
        );

        return true;
    } catch (error: any) {
        if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
        ) {
            return false;
        }

        // Other errors might be network-related, assume token is valid
        return true;
    }
};

export default getFirebaseAdmin;
