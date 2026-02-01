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

export function TransactionForm({ onSuccess, defaultValues, transactionId }: TransactionFormProps) {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: defaultValues || {
            amount: 0,
            description: "",
            category: "",
            type: "expense",
            date: new Date(),
        },
    })

    useEffect(() => {
        if (defaultValues) {
            form.reset(defaultValues);
        }
    }, [defaultValues, form, transactionId]);

    async function onSubmit(data: TransactionFormValues) {
        if (!user) return;
        setIsLoading(true);
        try {
            if (transactionId) {
                await updateTransaction(transactionId, data, user.id);
            } else {
                await createTransaction(data, user.id);
            }
            form.reset();
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
                <div className="flex gap-4">
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => date && field.onChange(date)}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
