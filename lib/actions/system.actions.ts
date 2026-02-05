"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import SystemConfig from "@/lib/database/models/system-config.model";

// Publicly accessible system configurations (safe keys only)
export async function getPublicSystemConfigs() {
    await connectToDatabase();

    const loanTypesConfig = await SystemConfig.findOne({ key: 'LOAN_TYPES' });
    const categoriesConfig = await SystemConfig.findOne({ key: 'TRANSACTION_CATEGORIES' });

    // Fallbacks matching those in the admin editor
    const defaultLoanTypes = [
        'Home Loan', 'Personal Loan', 'Vehicle Loan', 'Education Loan',
        'Credit Card', 'BNPL', 'Informal', 'Other'
    ];

    const defaultCategories = [
        { name: 'Salary', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Investments', type: 'income' },
        { name: 'Food', type: 'expense' },
        { name: 'Rent', type: 'expense' },
        { name: 'Utilities', type: 'expense' },
        { name: 'Transportation', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Health', type: 'expense' },
        { name: 'Shopping', type: 'expense' },
    ];

    return {
        loanTypes: loanTypesConfig?.value || defaultLoanTypes,
        categories: categoriesConfig?.value || defaultCategories
    };
}
