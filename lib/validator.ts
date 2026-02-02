import { z } from "zod";

export const transactionSchema = z.object({
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    category: z.string().min(1, "Category is required"),
    type: z.enum(["income", "expense"]),
    date: z.date(),
    paymentMethod: z.enum(["online", "cash"]).default("online"),
    bankAccount: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
