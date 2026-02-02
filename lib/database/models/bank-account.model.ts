import { Schema, model, models } from "mongoose";

const BankAccountSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bank: { type: Schema.Types.ObjectId, ref: "Bank", required: true },
    last4Digits: { type: String, required: true },
    mobileNumber: { type: String },
    upiId: { type: String },
}, { timestamps: true });

const BankAccount = models?.BankAccount || model("BankAccount", BankAccountSchema);

export default BankAccount;
