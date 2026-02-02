import { seedBanks } from "@/lib/actions/bank.actions";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await seedBanks();
        return NextResponse.json({ message: "Banks seeded successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to seed banks" }, { status: 500 });
    }
}
