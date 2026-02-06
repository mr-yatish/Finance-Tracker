import { Schema, model, models } from "mongoose";

const UserDeviceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    fcmToken: {
        type: String,
        required: true,
        index: true
    },
    deviceInfo: {
        browser: { type: String, default: "" },
        os: { type: String, default: "" },
        deviceType: { type: String, default: "desktop" },
        userAgent: { type: String, default: "" }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate tokens for the same user
UserDeviceSchema.index({ userId: 1, fcmToken: 1 }, { unique: true });

// Index for cleanup operations (finding inactive devices)
UserDeviceSchema.index({ lastUsed: 1, isActive: 1 });

const UserDevice = models?.UserDevice || model("UserDevice", UserDeviceSchema);

export default UserDevice;
