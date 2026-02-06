"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserEditDialog } from "./user-edit-dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UsersTableProps {
    users: any[];
}

export function UsersTable({ users }: UsersTableProps) {
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.firstName} {user.lastName}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {user.permissions?.length > 0 ? (
                                        user.permissions.slice(0, 2).map((p: string) => (
                                            <Badge key={p} variant="outline" className="text-xs">
                                                {p.split('_')[0]}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                    {user.permissions?.length > 2 && (
                                        <Badge variant="outline" className="text-xs">+{user.permissions.length - 2}</Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${user._id}`)}>
                                        View
                                    </Button>
                                    <UserEditDialog user={user} onSuccess={handleSuccess} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
