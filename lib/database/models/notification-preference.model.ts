import { Schema, model, models } from "mongoose";

const NotificationPreferenceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },

    // Global toggles
    pushEnabled: {
        type: Boolean,
        default: true
    },
    inAppEnabled: {
        type: Boolean,
        default: true
    },

    // Permission state
    permissionStatus: {
        type: String,
        enum: ["granted", "denied", "dismissed", "not_asked"],
        default: "not_asked"
    },
    permissionAskedAt: {
        type: Date,
        default: null
    },

    // Category-specific preferences
    categories: {
        transaction: {
            pushEnabled: { type: Boolean, default: true },
            inAppEnabled: { type: Boolean, default: true }
        },
        emi: {
            pushEnabled: { type: Boolean, default: true },
            inAppEnabled: { type: Boolean, default: true }
        },
        budget: {
            pushEnabled: { type: Boolean, default: true },
            inAppEnabled: { type: Boolean, default: true }
        },
        bank: {
            pushEnabled: { type: Boolean, default: true },
            inAppEnabled: { type: Boolean, default: true }
        },
        alert: {
            pushEnabled: { type: Boolean, default: true },
            inAppEnabled: { type: Boolean, default: true }
        },
        reminder: {
            pushEnabled: { type: Boolean, default: true },
            inAppEnabled: { type: Boolean, default: true }
        }
    },

    // Advanced preferences
    quietHours: {
        enabled: { type: Boolean, default: false },
        startTime: { type: String, default: "22:00" },
        endTime: { type: String, default: "08:00" },
        timezone: { type: String, default: "UTC" }
    },

    // Future: Email digest preferences
    emailDigest: {
        type: Boolean,
        default: false
    },
    emailDigestFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly"
    }
}, { timestamps: true });

const NotificationPreference = models?.NotificationPreference ||
    model("NotificationPreference", NotificationPreferenceSchema);

export default NotificationPreference;
