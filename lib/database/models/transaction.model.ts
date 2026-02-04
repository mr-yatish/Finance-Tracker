import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'] },
    isIncome: { type: Boolean },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['online', 'cash'], default: 'online' },
    bankAccount: { type: Schema.Types.ObjectId, ref: "BankAccount" },
    emi: { type: Schema.Types.ObjectId, ref: "Emi" }, // Link to EMI if this is an EMI payment
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' }, // For auto-posted EMIs
}, { timestamps: true });

// Force recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === 'development' && models.Transaction) {
    delete models.Transaction;
}

const Transaction = models?.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
