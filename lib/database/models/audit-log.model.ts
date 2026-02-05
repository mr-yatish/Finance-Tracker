import { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema({
    action: { type: String, required: true }, // e.g., 'UPDATE_ROLE', 'DELETE_USER'
    entity: { type: String, required: true }, // e.g., 'USER', 'TRANSACTION'
    entityId: { type: String }, // The ID of the affected entity
    details: { type: Schema.Types.Mixed }, // Detailed changes or context
    performedBy: { type: String, required: true }, // Clerk ID or Email of the admin
    status: { type: String, default: 'SUCCESS', enum: ['SUCCESS', 'FAILURE'] },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Add index for faster queries
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog = models?.AuditLog || model("AuditLog", AuditLogSchema);

export default AuditLog;
