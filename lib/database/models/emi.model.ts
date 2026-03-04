import { Schema, model, models } from "mongoose";

const EmiSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    loanType: {
        type: String,
        required: true,
        // Enum removed to allow dynamic management via Admin Panel
    },
    totalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    gstRate: { type: Number, default: 0 }, // GST on Interest Component
    tenureMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Can be calculated, but good to store for quick access
    emiAmount: { type: Number, required: true },
    remainingAmount: { type: Number }, // Updates after every payment
    status: { type: String, enum: ['active', 'closed', 'foreclosed'], default: 'active' },
    lender: { type: String, required: true },
    autoDebit: { type: Boolean, default: false },
    bankAccount: { type: Schema.Types.ObjectId, ref: "BankAccount" }, // For auto-debit source
    nextPaymentDate: { type: Date },
    lastPaymentDate: { type: Date },
    history: [{
        transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['regular', 'prepayment'], default: 'regular' },
        interestComponent: { type: Number },
        gstComponent: { type: Number },
        principalComponent: { type: Number }

    }]
}, { timestamps: true });

// Force recompilation in dev
if (process.env.NODE_ENV === 'development' && models.Emi) {
    delete models.Emi;
}

const Emi = models?.Emi || model("Emi", EmiSchema);

export default Emi;
