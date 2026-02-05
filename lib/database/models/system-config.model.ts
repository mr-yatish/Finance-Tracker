import { Schema, model, models } from "mongoose";

const SystemConfigSchema = new Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'MAINTENANCE_MODE'
    value: { type: Schema.Types.Mixed, required: true },
    pluginId: { type: String }, // Optional, for grouping
    description: { type: String },
}, { timestamps: true });

const SystemConfig = models?.SystemConfig || model("SystemConfig", SystemConfigSchema);

export default SystemConfig;
