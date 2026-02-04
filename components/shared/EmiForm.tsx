"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { EmiFormValues, emiSchema } from "@/lib/validator"
import { createEmi } from "@/lib/actions/emi.actions"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

// Props: Receive userId and bankAccounts
export function EmiForm({ userId, bankAccounts }: { userId: string, bankAccounts: any[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [estimatedEmi, setEstimatedEmi] = useState<number | null>(null);

    const form = useForm<EmiFormValues>({
        resolver: zodResolver(emiSchema) as any, // Cast to any to avoid strict type mismatch
        defaultValues: {
            name: "",
            loanType: "Personal Loan",
            totalAmount: 0,
            interestRate: 10,
            gstRate: 0,
            tenureMonths: 12,
            installmentsPaid: 0,
            startDate: new Date(),
            lender: "",
            autoDebit: false,
            bankAccount: "",
        },
    })

    // Watch values to calculate EMI estimate live
    const amount = form.watch("totalAmount");
    const rate = form.watch("interestRate");
    const tenure = form.watch("tenureMonths");

    useEffect(() => {
        if (amount > 0 && tenure > 0) {
            const numRate = Number(rate);
            if (numRate === 0) {
                setEstimatedEmi(Math.round(amount / tenure));
            } else {
                const r = numRate / 12 / 100;
                const emi = (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
                setEstimatedEmi(Math.round(emi));
            }
        } else {
            setEstimatedEmi(null);
        }
    }, [amount, rate, tenure]);

    async function onSubmit(data: EmiFormValues) {
        setIsSubmitting(true);
        try {
            await createEmi({
                userId,
                ...data,
                bankAccountId: data.bankAccount || undefined,
                path: '/emis'
            });
            toast.success("EMI Created Successfully");
            router.push("/emis");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create EMI");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* ROW 1: Identity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loan Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. HDFC Home Loan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="loanType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loan Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {['Home Loan', 'Personal Loan', 'Vehicle Loan', 'Education Loan', 'Credit Card', 'BNPL', 'Informal', 'Other'].map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lender / Bank Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. HDFC" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* ROW 2: Financials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loan Amount (Principal)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="100000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="interestRate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Interest Rate (% p.a)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" placeholder="10.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gstRate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GST on Interest (%)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="1" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* ROW 3: Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="tenureMonths"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tenure (Months)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Loan Start Date</FormLabel>
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
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="installmentsPaid"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Already Paid (Months)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {estimatedEmi !== null && (
                    <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center text-sm border border-border">
                        <span className="text-muted-foreground">Estimated Monthly EMI:</span>
                        <span className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(estimatedEmi)}
                        </span>
                    </div>
                )}

                {/* ROW 4: Payment Setup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl bg-card">
                    <FormField
                        control={form.control}
                        name="bankAccount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Linked Bank Account (for payments)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Account" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {bankAccounts.length > 0 ? bankAccounts.map((acc: any) => (
                                            <SelectItem key={acc._id} value={acc._id}>
                                                {acc.bank.name} - {acc.last4Digits || '****'}
                                            </SelectItem>
                                        )) : (
                                            <SelectItem value="none" disabled>No accounts available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="autoDebit"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Auto-Debit Simulation
                                    </FormLabel>
                                    <FormDescription>
                                        Auto-post expenses on due date
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Loan Track...
                        </>
                    ) : (
                        "Create Loan Track"
                    )}
                </Button>
            </form>
        </Form>
    )
}
