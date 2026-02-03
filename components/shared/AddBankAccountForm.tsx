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
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createBankAccount, getBanks } from "@/lib/actions/bank.actions"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/lib/hooks/use-media-query"

const bankAccountSchema = z.object({
    bankId: z.string().min(1, "Please select a bank"),
    last4Digits: z.string().length(4, "Must be exactly 4 digits").regex(/^\d+$/, "Must be numbers"),
    mobileNumber: z.string().optional(),
    upiId: z.string().optional(),
})

type BankAccountFormValues = z.infer<typeof bankAccountSchema>

interface AddBankAccountFormProps {
    onSuccess?: () => void;
}

export function AddBankAccountForm({ onSuccess }: AddBankAccountFormProps) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [banks, setBanks] = useState<{ _id: string; name: string; logo?: string }[]>([]);
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    useEffect(() => {
        async function fetchBanks() {
            try {
                const data = await getBanks();
                setBanks(data);
            } catch (error) {
                console.error("Failed to load banks", error);
            }
        }
        fetchBanks();
    }, []);

    const form = useForm<BankAccountFormValues>({
        resolver: zodResolver(bankAccountSchema),
        defaultValues: {
            bankId: "",
            last4Digits: "",
            mobileNumber: "",
            upiId: "",
        },
    })

    async function onSubmit(data: BankAccountFormValues) {
        if (!user) return;
        setIsLoading(true);
        try {
            await createBankAccount({
                userId: user.id,
                bankId: data.bankId,
                last4Digits: data.last4Digits,
                mobileNumber: data.mobileNumber,
                upiId: data.upiId,
            });
            form.reset();
            onSuccess?.();
            toast.success("Bank account added successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add bank account.");
        } finally {
            setIsLoading(false);
        }
    }

    const BankList = (
        <Command>
            <CommandInput placeholder="Search bank..." />
            <CommandList>
                <CommandEmpty>No bank found.</CommandEmpty>
                <CommandGroup>
                    {banks.map((bank) => (
                        <CommandItem
                            value={bank.name}
                            key={bank._id}
                            onSelect={() => {
                                form.setValue("bankId", bank._id)
                                setOpen(false)
                            }}
                            className="cursor-pointer"
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    bank._id === form.getValues("bankId")
                                        ? "opacity-100"
                                        : "opacity-0"
                                )}
                            />
                            <div className="flex items-center gap-2 pointer-events-none">
                                {bank.logo && <img src={bank.logo} alt={bank.name} className="h-4 w-4 object-contain" />}
                                {bank.name}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="bankId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Bank Name</FormLabel>
                            {isDesktop ? (
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? (() => {
                                                        const bank = banks.find((b) => b._id === field.value);
                                                        return bank ? (
                                                            <div className="flex items-center gap-2">
                                                                {bank.logo && <img src={bank.logo} alt={bank.name} className="h-4 w-4 object-contain" />}
                                                                {bank.name}
                                                            </div>
                                                        ) : "Select bank"
                                                    })()
                                                    : "Select bank"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start">
                                        {BankList}
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <Sheet open={open} onOpenChange={setOpen}>
                                    <SheetTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? (() => {
                                                        const bank = banks.find((b) => b._id === field.value);
                                                        return bank ? (
                                                            <div className="flex items-center gap-2">
                                                                {bank.logo && <img src={bank.logo} alt={bank.name} className="h-4 w-4 object-contain" />}
                                                                {bank.name}
                                                            </div>
                                                        ) : "Select bank"
                                                    })()
                                                    : "Select bank"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="p-0">
                                        <SheetHeader className="p-4 border-b">
                                            <SheetTitle>Select Bank</SheetTitle>
                                        </SheetHeader>
                                        {BankList}
                                    </SheetContent>
                                </Sheet>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="last4Digits"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last 4 Digits of Account Number</FormLabel>
                            <FormControl>
                                <Input placeholder="1234" maxLength={4} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Linked Mobile Number (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="upiId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>UPI ID (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="username@upi" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Add Bank Account"}
                </Button>
            </form>
        </Form>
    )
}
