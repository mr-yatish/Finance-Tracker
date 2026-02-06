"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { TransactionForm } from "@/components/shared/TransactionForm"
import { deleteTransaction } from "@/lib/actions/transaction.actions"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

interface TransactionItemProps {
    transaction: any;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
    const { user } = useUser();
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleDelete = async () => {
        if (!user) return;
        const confirm = window.confirm("Are you sure you want to delete this transaction?");
        if (confirm) {
            await deleteTransaction(transaction._id, user.id);
            router.refresh();
        }
    };

    return (
        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 group">
            <div className="flex flex-col">
                <span className="font-medium">{transaction.description || transaction.category}</span>
                <span className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), "PPP")}
                    {transaction.type === 'expense' && (
                        <span className="ml-2">
                            • {transaction.paymentMethod === 'cash' ? 'Cash' : (
                                transaction.bankAccount?.bank?.name ? `${transaction.bankAccount.bank.name} (*${transaction.bankAccount.last4Digits})` : 'Online'
                            )}
                        </span>
                    )}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <div className={`font-bold ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                            Make changes to your transaction here.
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionForm
                        onSuccess={() => setIsEditOpen(false)}
                        transactionId={transaction._id}
                        defaultValues={{
                            description: transaction.description || "",
                            amount: transaction.amount || 0,
                            category: transaction.category || "other",
                            type: transaction.type || "expense",
                            date: new Date(transaction.date || Date.now()),
                            paymentMethod: transaction.paymentMethod || "online",
                            bankAccount: transaction.bankAccount?._id || "",
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
