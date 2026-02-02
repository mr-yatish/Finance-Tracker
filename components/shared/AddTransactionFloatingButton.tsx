"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionForm } from "./TransactionForm"

export function AddTransactionFloatingButton() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 z-50 transition-transform hover:scale-105"
                >
                    <Plus className="h-6 w-6 text-primary-foreground" />
                    <span className="sr-only">Add Transaction</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
