import { Schema, model, models } from "mongoose";

const SystemLogSchema = new Schema({
    level: { type: String, required: true, enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'] },
    action: { type: String, required: true },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed }, // Flexible for inputs/objects
    userId: { type: String }, // Optional Clerk ID
    timestamp: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 } // Auto-delete after 7 days
});

const SystemLog = models?.SystemLog || model("SystemLog", SystemLogSchema);

export default SystemLog;
