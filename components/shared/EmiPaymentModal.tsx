"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { processEmiPayment, prepayEmi } from "@/lib/actions/emi.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const paymentSchema = z.object({
    type: z.enum(["regular", "prepayment"]),
    amount: z.coerce.number().positive(),
    date: z.date().optional(), // In a real app we might let user pick date, here we default to now for logic simplicity
})

export function EmiPaymentModal({ emi }: { emi: any }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema) as any,
        defaultValues: {
            type: "regular",
            amount: emi.emiAmount,
        }
    })

    // Update amount when type changes
    const type = form.watch("type");
    if (type === "regular" && form.getValues("amount") !== emi.emiAmount) {
        form.setValue("amount", emi.emiAmount);
    }

    async function onSubmit(data: z.infer<typeof paymentSchema>) {
        setIsSubmitting(true);
        try {
            if (data.type === "regular") {
                await processEmiPayment(emi._id);
                toast.success("EMI Payment recorded successfully");
            } else {
                await prepayEmi({
                    emiId: emi._id,
                    amount: data.amount,
                    path: `/emis/${emi._id}`
                });
                toast.success("Prepayment successful! Tenure/EMI updated.");
            }
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to process payment");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Record Payment</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Loan Payment</DialogTitle>
                    <DialogDescription>
                        Record a regular monthly EMI or make a prepayment to reduce your principal.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="regular">Regular Monthly EMI</SelectItem>
                                            <SelectItem value="prepayment">Prepayment (Extra)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            disabled={type === "regular"} // Lock amount for regular EMI
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {type === 'prepayment' && (
                            <p className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                                Prepayments will be adjusted against the principal amount, reducing your outstanding balance and potentially your tenure/EMI.
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
