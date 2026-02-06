import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let messaging: Messaging | null = null;

export const initializeFirebase = (): FirebaseApp => {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    return app;
};

// Initialize Firebase Messaging (browser only)
export const initializeMessaging = (): Messaging | null => {
    if (typeof window === "undefined") {
        return null; // Server-side, return null
    }

    try {
        const app = initializeFirebase();
        if (!messaging) {
            messaging = getMessaging(app);
        }
        return messaging;
    } catch (error) {
        console.error("Firebase Messaging initialization error:", error);
        return null;
    }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        const messaging = initializeMessaging();
        if (!messaging) {
            throw new Error("Messaging not supported in this environment");
        }

        // Request browser permission
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            return token;
        } else {
            console.warn("Notification permission denied");
            return null;
        }
    } catch (error) {
        console.error("Error getting notification permission:", error);
        return null;
    }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
    const messaging = initializeMessaging();
    if (!messaging) {
        console.warn("Messaging not available");
        return () => { }; // Return empty unsubscribe function
    }

    return onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        callback(payload);
    });
};

// Get device information
export const getDeviceInfo = () => {
    if (typeof window === "undefined") {
        return {
            browser: "Unknown",
            os: "Unknown",
            deviceType: "Unknown",
            userAgent: "",
        };
    }

    const ua = navigator.userAgent;

    // Detect browser
    let browser = "Unknown";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

    // Detect OS
    let os = "Unknown";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    // Detect device type
    let deviceType = "desktop";
    if (/Mobi|Android/i.test(ua)) deviceType = "mobile";
    else if (/Tablet|iPad/i.test(ua)) deviceType = "tablet";

    return {
        browser,
        os,
        deviceType,
        userAgent: ua,
    };
};

export { firebaseConfig };
