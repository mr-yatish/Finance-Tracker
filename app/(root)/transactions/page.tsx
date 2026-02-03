import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/shared/TransactionForm";
import { auth } from "@clerk/nextjs/server";
import { getTransactions } from "@/lib/actions/transaction.actions";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { TransactionList } from "@/components/shared/TransactionList";

export default async function TransactionsPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    let transactions: any[] = [];
    try {
        transactions = await getTransactions(userId);
    } catch (error) {
        console.error("Failed to load transactions:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Transaction</DialogTitle>
                            <DialogDescription>
                                Record a new income or expense.
                            </DialogDescription>
                        </DialogHeader>
                        <TransactionForm />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Client Component for Filtering & Export */}
            <TransactionList transactions={transactions} />
        </div>
    );
}
