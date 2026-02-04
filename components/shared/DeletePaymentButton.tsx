"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteEmiPayment } from "@/lib/actions/emi.actions"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

export function DeletePaymentButton({ emiId, historyId }: { emiId: string, historyId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            await deleteEmiPayment({ emiId, historyId, path: `/emis/${emiId}` });
            toast.success("Payment deleted successfully. Balance reversed.");
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete the payment record and **add the amount back to the remaining loan balance**. The associated transaction will also be removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isPending ? "Deleting..." : "Delete Payment"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
