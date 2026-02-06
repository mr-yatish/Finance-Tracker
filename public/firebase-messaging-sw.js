// Firebase Messaging Service Worker
// This file handles background notifications when the web app is not in focus

importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
    apiKey: "AIzaSyDmsQFU5nUkfShuUU5KA0TbyLmCiwhFNns",
    authDomain: "finance-tracker-84e41.firebaseapp.com",
    projectId: "finance-tracker-84e41",
    storageBucket: "finance-tracker-84e41.firebasestorage.app",
    messagingSenderId: "464316416866",
    appId: "1:464316416866:web:f4f43d18544b9c5d05623b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    // Extract notification data
    const notificationTitle = payload.notification?.title || 'Finance Tracker';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/icons/notification-icon.png',
        badge: '/icons/notification-badge.png',
        tag: payload.data?.notificationId || 'default-tag',
        data: {
            url: payload.data?.actionUrl || '/dashboard',
            notificationId: payload.data?.notificationId,
            type: payload.data?.type,
        },
        requireInteraction: false,
        vibrate: [200, 100, 200],
    };

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/dashboard';
    const notificationId = event.notification.data?.notificationId;

    // Open the URL
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already a window open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    // Mark notification as read (call API)
                    if (notificationId) {
                        fetch('/api/notifications/mark-read', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ notificationId }),
                        }).catch((err) => console.error('Failed to mark notification as read:', err));
                    }

                    // Focus existing window and navigate
                    client.focus();
                    return client.navigate(urlToOpen);
                }
            }

            // No window open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker activated');
    event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker installed');
    self.skipWaiting();
});
