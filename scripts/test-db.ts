
import { connectToDatabase } from "@/lib/database/mongoose";
import Transaction from "@/lib/database/models/transaction.model";
import User from "@/lib/database/models/user.model";

async function test() {
    try {
        console.log("Connecting...");
        await connectToDatabase();
        console.log("Connected.");

        // Create a dummy user if needed or pick first
        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            return;
        }

        console.log("Creating Test Transaction...");
        const tx = await Transaction.create({
            user: user._id,
            amount: 100,
            type: 'income',
            isIncome: true,
            category: 'salary',
            description: 'Test Script Income'
        });

        console.log("Created:", tx.toObject());

        const fetched = await Transaction.findById(tx._id);
        console.log("Fetched:", fetched?.toObject());

        console.log("Cleanup...");
        await Transaction.findByIdAndDelete(tx._id);
        console.log("Done.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
