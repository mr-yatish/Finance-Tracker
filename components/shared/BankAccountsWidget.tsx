"use client"

import { useState, useEffect } from "react"
import { getUserBankAccounts } from "@/lib/actions/bank.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CreditCard } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AddBankAccountForm } from "./AddBankAccountForm"
import { useUser } from "@clerk/nextjs"

export function BankAccountsWidget() {
    const { user } = useUser();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchAccounts = async () => {
        if (user) {
            try {
                const data = await getUserBankAccounts(user.id);
                setAccounts(data);
            } catch (error) {
                console.error("Failed to fetch accounts", error);
            }
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [user]);

    return (
        <Card className="h-full rounded-3xl border-none shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Bank Accounts</CardTitle>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add Account</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Bank Account</DialogTitle>
                            <DialogDescription>
                                Link a new bank account for online transactions.
                            </DialogDescription>
                        </DialogHeader>
                        <AddBankAccountForm onSuccess={() => {
                            setIsOpen(false);
                            fetchAccounts();
                        }} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {accounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <CreditCard className="mb-2 h-8 w-8 opacity-50" />
                            <p className="text-sm">No linked accounts</p>
                        </div>
                    ) : (
                        accounts.map((account) => (
                            <div key={account._id} className="flex items-center justify-between rounded-xl border p-3">
                                <div className="flex items-center gap-3">
                                    {account.bank.logo ? (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
                                            <img
                                                src={account.bank.logo}
                                                alt={account.bank.name}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-sm">{account.bank.name}</p>
                                        <p className="text-xs text-muted-foreground">**** {account.last4Digits}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
