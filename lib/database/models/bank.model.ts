import { Schema, model, models } from "mongoose";

const BankSchema = new Schema({
    name: { type: String, required: true, unique: true },
    acceptsOnline: { type: Boolean, default: true },
    logo: { type: String },
}, { timestamps: true });

const Bank = models?.Bank || model("Bank", BankSchema);

export default Bank;
