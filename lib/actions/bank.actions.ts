"use server";

import { logEvent, LogLevel } from "@/lib/actions/logger.actions";

import { connectToDatabase } from "@/lib/database/mongoose";
import Bank from "@/lib/database/models/bank.model";
import BankAccount from "@/lib/database/models/bank-account.model";
import User from "@/lib/database/models/user.model";
import { revalidatePath } from "next/cache";

export async function seedBanks() {
    try {
        await connectToDatabase();

        const banks = [
            { name: "State Bank of India (SBI)", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=sbi.co.in&sz=128" },
            { name: "HDFC Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128" },
            { name: "ICICI Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=icicibank.com&sz=128" },
            { name: "Axis Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=axisbank.com&sz=128" },
            { name: "Kotak Mahindra Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=kotak.com&sz=128" },
            { name: "Punjab National Bank (PNB)", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=pnbindia.in&sz=128" },
            { name: "Bank of Baroda", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=bankofbaroda.in&sz=128" },
            { name: "Canara Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=canarabank.com&sz=128" },
            { name: "Union Bank of India", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=unionbankofindia.co.in&sz=128" },
            { name: "IndusInd Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=indusind.com&sz=128" },
            { name: "Yes Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=yesbank.in&sz=128" },
            { name: "IDFC First Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=idfcfirstbank.com&sz=128" },
            { name: "Bank of India", acceptsOnline: true, logo: "https://icons.duckduckgo.com/ip3/bankofindia.co.in.ico" },
            { name: "Central Bank of India", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=centralbankofindia.co.in&sz=128" },
            { name: "Indian Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=indianbank.in&sz=128" },
            { name: "Indian Overseas Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=iob.in&sz=128" },
            { name: "UCO Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=ucobank.com&sz=128" },
            { name: "Bank of Maharashtra", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=bankofmaharashtra.in&sz=128" },
            { name: "Punjab & Sind Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=psbindia.com&sz=128" },
            { name: "Federal Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=federalbank.co.in&sz=128" },
            { name: "IDBI Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=idbibank.in&sz=128" },
            { name: "Bandhan Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=bandhanbank.com&sz=128" },
            { name: "AU Small Finance Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=aubank.in&sz=128" },
            { name: "Standard Chartered Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=sc.com&sz=128" },
            { name: "Citibank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=online.citibank.co.in&sz=128" },
            { name: "HSBC Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=hsbc.co.in&sz=128" },
            { name: "DBS Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=dbs.com&sz=128" },
            { name: "RBL Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=rblbank.com&sz=128" },
            { name: "Karur Vysya Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=kvb.co.in&sz=128" },
            { name: "City Union Bank", acceptsOnline: true, logo: "https://www.google.com/s2/favicons?domain=cityunionbank.com&sz=128" },
        ];

        // Delete existing banks to re-seed with logos if needed, or just update upsert logic.
        // For safe update of logos without clearing IDs if they exist:
        // upsert handles it.

        console.log("Starting bank seed...");
        console.log("Starting bank seed...");

        // Use Promise.all for parallel execution to speed up seeding and prevent potential timeouts
        await Promise.all(banks.map(bank =>
            Bank.updateOne(
                { name: bank.name },
                { $set: { logo: bank.logo, acceptsOnline: bank.acceptsOnline } },
                { upsert: true }
            )
        ));

        console.log("Banks seeded successfully");
        return JSON.parse(JSON.stringify({ message: "Banks seeded with GOOGLE LOGOS" }));
    } catch (error: any) {
        console.error("Error seeding banks:", error);
        throw new Error(`Failed to seed banks: ${error.message}`);
    }
}

export async function getBanks() {
    try {
        await connectToDatabase();
        let banks = await Bank.find().sort({ name: 1 });

        // Check for old/broken logos (using Bank of India as marker) to trigger re-seed
        const needsUpdate = await Bank.findOne({ name: "Bank of India", logo: { $regex: "duckduckgo" } });

        if (banks.length === 0 || needsUpdate) {
            console.log("Seeding/Updating banks due to missing data or old logos...");
            await logEvent({ action: "getBanks", message: "Triggering bank seed", details: { reason: banks.length === 0 ? "No banks" : "Update needed" } });
            await seedBanks();
            banks = await Bank.find().sort({ name: 1 });
        }

        return JSON.parse(JSON.stringify(banks));
    } catch (error: any) {
        console.error("Error fetching banks:", error);
        await logEvent({ action: "getBanks", level: LogLevel.ERROR, message: "Failed to fetch banks", details: { error: error.message } });
        throw new Error("Failed to fetch banks");
    }
}

export async function createBankAccount(accountData: {
    userId: string;
    bankId: string;
    last4Digits: string;
    mobileNumber?: string;
    upiId?: string;
}) {
    try {
        await connectToDatabase();
        await logEvent({ action: "createBankAccount", message: "Attempting to create bank account", details: { userId: accountData.userId, bankId: accountData.bankId }, userId: accountData.userId });

        // Check if user exists (userId is clerkId)
        const user = await User.findOne({ clerkId: accountData.userId });
        if (!user) throw new Error("User not found");

        const existingAccount = await BankAccount.findOne({
            user: user._id,
            bank: accountData.bankId,
            last4Digits: accountData.last4Digits,
        });

        if (existingAccount) {
            await logEvent({ action: "createBankAccount", level: LogLevel.WARN, message: "Bank account already exists", details: { userId: user._id, bankId: accountData.bankId } });
            throw new Error("This bank account is already linked.");
        }

        const newAccount = await BankAccount.create({
            user: user._id,
            bank: accountData.bankId,
            last4Digits: accountData.last4Digits,
            mobileNumber: accountData.mobileNumber,
            upiId: accountData.upiId,
        });

        await logEvent({ action: "createBankAccount", message: "Bank account created successfully", details: { accountId: newAccount._id } });

        revalidatePath("/dashboard");
        return JSON.parse(JSON.stringify(newAccount));
    } catch (error: any) {
        console.error("Error creating bank account:", error);
        await logEvent({ action: "createBankAccount", level: LogLevel.ERROR, message: "Failed to create bank account", details: { error: error.message, stack: error.stack } });
        throw new Error(error.message || "Failed to create bank account");
    }
}

export async function getUserBankAccounts(userId: string) {
    try {
        await connectToDatabase();

        // Check if user exists (userId is clerkId)
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            throw new Error("User not found");
        }

        const accounts = await BankAccount.find({ user: user._id }).populate('bank');
        return JSON.parse(JSON.stringify(accounts));
    } catch (error: any) {
        console.error("Error fetching user bank accounts:", error);
        throw new Error(error.message || "Failed to fetch user bank accounts");
    }
}
