"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createTransaction, updateTransaction } from "@/lib/actions/transaction.actions"
import { transactionSchema, TransactionFormValues } from "@/lib/validator"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface TransactionFormProps {
    onSuccess?: () => void;
    defaultValues?: TransactionFormValues;
    transactionId?: string;
}

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getUserBankAccounts } from "@/lib/actions/bank.actions"
import { AddBankAccountForm } from "./AddBankAccountForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export function TransactionForm({ onSuccess, defaultValues, transactionId }: TransactionFormProps) {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [isAddBankOpen, setIsAddBankOpen] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: defaultValues || {
            amount: 0,
            description: "",
            category: "",
            type: "expense",
            date: new Date(),
            paymentMethod: "online",
            bankAccount: "",
        },
    })

    const paymentMethod = form.watch("paymentMethod");

    useEffect(() => {
        if (defaultValues) {
            // Ensure paymentMethod is set, default to online if missing (migration)
            const values = {
                ...defaultValues,
                paymentMethod: defaultValues.paymentMethod || "online"
            }
            form.reset(values);
        }
    }, [defaultValues, form, transactionId]);

    const fetchBankAccounts = async () => {
        if (user) {
            try {
                const accounts = await getUserBankAccounts(user.id);
                setBankAccounts(accounts);
                // Auto-select first account if none selected and accounts exist
                if (accounts.length > 0 && !form.getValues("bankAccount")) {
                    form.setValue("bankAccount", accounts[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch bank accounts", error);
            }
        }
    };

    useEffect(() => {
        fetchBankAccounts();
    }, [user]);

    async function onSubmit(data: TransactionFormValues) {
        if (!user) return;
        setIsLoading(true);
        try {
            if (transactionId) {
                await updateTransaction(transactionId, data, user.id);
            } else {
                await createTransaction(data, user.id);
            }
            form.reset({
                amount: 0,
                description: "",
                category: "",
                type: "expense",
                date: new Date(),
                paymentMethod: "online",
                bankAccount: "",
            });
            onSuccess?.();
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Grocery, Salary, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-4 sm:flex-row">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Type</FormLabel>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant={field.value === "income" ? "default" : "outline"}
                                        className={cn(
                                            "flex-1",
                                            field.value === "income" && "bg-emerald-500 hover:bg-emerald-600 text-white"
                                        )}
                                        onClick={() => field.onChange("income")}
                                    >
                                        Income
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={field.value === "expense" ? "default" : "outline"}
                                        className={cn(
                                            "flex-1",
                                            field.value === "expense" && "bg-rose-500 hover:bg-rose-600 text-white"
                                        )}
                                        onClick={() => field.onChange("expense")}
                                    >
                                        Expense
                                    </Button>
                                </div>
                                <input type="hidden" name="debug_type" value={field.value} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="online" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Online
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="cash" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Cash
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {paymentMethod === "online" && (
                    <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="bankAccount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bank Account</FormLabel>
                                    {bankAccounts.length > 0 ? (
                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Bank Account" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {bankAccounts.map((account) => (
                                                    <SelectItem key={account._id} value={account._id}>
                                                        <div className="flex items-center gap-2">
                                                            {account.bank.logo && (
                                                                <img
                                                                    src={account.bank.logo}
                                                                    alt={account.bank.name}
                                                                    className="h-4 w-4 object-contain"
                                                                />
                                                            )}
                                                            <span>{account.bank.name} - {account.last4Digits}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm text-yellow-600 font-medium">No bank accounts linked.</p>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Bank Account</DialogTitle>
                                </DialogHeader>
                                <AddBankAccountForm onSuccess={() => {
                                    setIsAddBankOpen(false);
                                    fetchBankAccounts();
                                }} />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="food">Food</SelectItem>
                                    <SelectItem value="housing">Housing</SelectItem>
                                    <SelectItem value="transport">Transport</SelectItem>
                                    <SelectItem value="salary">Salary</SelectItem>
                                    <SelectItem value="utilities">Utilities</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                    <SelectItem value="sutta">Sutta</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                                    max={format(new Date(), "yyyy-MM-dd")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Transaction"}
                </Button>
            </form>
        </Form>
    )
}
