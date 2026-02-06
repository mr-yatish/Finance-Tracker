import { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    type: {
        type: String,
        required: true,
        enum: ["transaction", "emi", "budget", "bank", "alert", "reminder"],
        index: true
    },
    category: {
        type: String,
        trim: true
    },

    // Metadata
    data: {
        type: Schema.Types.Mixed,
        default: {}
    },
    actionUrl: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        trim: true
    },

    // Status tracking
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    },

    // Delivery tracking
    deliveryLog: {
        pushSent: { type: Boolean, default: false },
        pushSentAt: { type: Date, default: null },
        pushDelivered: { type: Boolean, default: false },
        pushError: { type: String, default: null },
        inAppCreated: { type: Boolean, default: true },
        inAppCreatedAt: { type: Date, default: Date.now }
    },

    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 }); // For pagination
NotificationSchema.index({ userId: 1, isRead: 1 });     // For unread count
NotificationSchema.index({ userId: 1, type: 1 });       // For filtering by type
NotificationSchema.index({ userId: 1, isDeleted: 1 });  // For active notifications

const Notification = models?.Notification || model("Notification", NotificationSchema);

export default Notification;
