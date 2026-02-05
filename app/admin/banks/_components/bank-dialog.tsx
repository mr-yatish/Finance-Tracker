"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createBank, updateBank } from "@/lib/actions/bank.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BankDialogProps {
    mode: 'create' | 'edit';
    bank?: any;
    trigger?: React.ReactNode;
}

export function BankDialog({ mode, bank, trigger }: BankDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(bank?.name || "");
    const [logo, setLogo] = useState(bank?.logo || "");
    const [acceptsOnline, setAcceptsOnline] = useState(bank?.acceptsOnline ?? true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'create') {
                await createBank({ name, logo, acceptsOnline });
                toast.success("Bank created");
            } else {
                await updateBank(bank._id, { name, logo, acceptsOnline });
                toast.success("Bank updated");
            }
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to save bank");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Add Bank</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? "Add New Bank" : "Edit Bank"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="online"
                            checked={acceptsOnline}
                            onCheckedChange={(c) => setAcceptsOnline(!!c)}
                        />
                        <Label htmlFor="online">Accepts Online</Label>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
