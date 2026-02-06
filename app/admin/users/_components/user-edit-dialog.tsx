"use client";

import { useState } from "react";
import { updateUserRole } from "@/lib/actions/admin.actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ROLE_PERMISSIONS } from "@/lib/constants/permissions";

interface User {
    _id: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
}

interface UserEditDialogProps {
    user: User;
    onSuccess: () => void;
}

export function UserEditDialog({ user, onSuccess }: UserEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(user.role);
    const [permissions, setPermissions] = useState<string[]>(user.permissions || []);
    const [loading, setLoading] = useState(false);

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        // Reset permissions to default for that role if needed, or keep valid ones
        // For simplicity, we can specific permissions logic here.
    };

    const togglePermission = (perm: string) => {
        setPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUserRole(user._id, role, permissions);
            toast.success("User updated successfully");
            setOpen(false);
            onSuccess();
        } catch (error) {
            toast.error("Failed to update user");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Make changes to user role and permissions.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={handleRoleChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Permissions</h4>
                        <div className="grid gap-2">
                            {ROLE_PERMISSIONS['ADMIN'].map((perm) => (
                                <div key={perm} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={perm}
                                        checked={permissions.includes(perm)}
                                        onCheckedChange={() => togglePermission(perm)}
                                    />
                                    <Label htmlFor={perm} className="text-sm font-normal cursor-pointer">
                                        {perm}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
