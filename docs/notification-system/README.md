# 🔔 Finance Tracker - Notification System

Complete Web Push and In-App notification system using Firebase Cloud Messaging.

---

## 🎯 Features

- ✅ **Web Push Notifications** via Firebase Cloud Messaging
- ✅ **In-App Notification Center** with bell icon & dropdown
- ✅ **Multi-Device Support** - One user, multiple devices
- ✅ **UX-First Permission Flow** - No auto-prompts
- ✅ **Granular User Preferences** - Control by category
- ✅ **Real-Time Updates** - Foreground & background messages

---

## 📱 Notification Types

| Type | Description | Icon |
|------|-------------|------|
| Transaction | Income/expense updates | 💰 |
| EMI | Payment reminders | 📅 |
| Budget | Limit alerts | 📉 |
| Bank | Account changes | 🏦 |  
| Alert | System notifications | ⚠️ |
| Reminder | General reminders | 🔔 |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Fix npm permissions (if needed)
sudo chown -R 501:20 "/Users/yatish/.npm"

# Install packages
npm install @radix-ui/react-scroll-area firebase firebase-admin
```

### 2. Local Testing

```bash
# Create database indexes
npm run notification:indexes

# Run dev server
npm run dev
```

### 3. Deploy to Production

See **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** for complete deployment guide.

---

## 📚 Documentation

- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Complete architecture & design
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Deployment guide with Vercel setup

---

## 🧹 Maintenance

```bash
# Create database indexes
npm run notification:indexes

# Cleanup old notifications (run monthly)
npm run notification:cleanup
```

---

## 🎓 Usage Example

```typescript
import { createNotification } from "@/lib/actions/notification.actions";

// Send a notification
await createNotification(user.id, {
    title: "💰 Transaction Created",
    message: "Your expense of ₹500 has been recorded",
    type: "transaction",
    actionUrl: "/transactions",
    sendPush: true,
});
```

---

## ✅ Status

- ✅ **Local Setup**: Complete
- ✅ **Firebase Config**: Integrated
- ⏳ **Dependencies**: Install required
- ⏳ **Production**: Follow checklist

---

**Next**: See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for deployment steps.
