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

export const emiSchema = z.object({
    name: z.string().min(3, "Loan name must be at least 3 characters"),
    loanType: z.enum(['Home Loan', 'Personal Loan', 'Vehicle Loan', 'Education Loan', 'Credit Card', 'BNPL', 'Informal', 'Other']),
    totalAmount: z.coerce.number().min(1, "Amount must be greater than 0"),
    interestRate: z.coerce.number().min(0, "Interest rate cannot be negative"),
    gstRate: z.coerce.number().min(0).default(0),
    tenureMonths: z.coerce.number().min(1, "Tenure must be at least 1 month"),
    installmentsPaid: z.coerce.number().min(0).default(0),
    startDate: z.date(),
    lender: z.string().min(2, "Lender name is required"),
    autoDebit: z.boolean().default(false),
    bankAccount: z.string().optional(),
});

export type EmiFormValues = z.infer<typeof emiSchema>;
