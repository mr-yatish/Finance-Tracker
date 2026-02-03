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
import { TransactionItem } from "@/components/shared/TransactionItem";

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
                {/* We need a Client Component wrapper for Dialog if we want to control open state, 
            but using DialogTrigger is fine for simple open. 
            However, closing on success requires controlled state or key reset.
            For simplicity in this step, we rely on basic usage.
        */}
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

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            No transactions yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx: any) => (
                                <TransactionItem key={tx._id} transaction={tx} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
