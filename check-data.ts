import { connectToDatabase } from "@/lib/database/mongoose";
import Bank from "@/lib/database/models/bank.model";

async function check() {
    try {
        await connectToDatabase();
        const banks = await Bank.find();
        console.log("Total banks:", banks.length);
        if (banks.length > 0) {
            console.log("First bank:", JSON.stringify(banks[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
