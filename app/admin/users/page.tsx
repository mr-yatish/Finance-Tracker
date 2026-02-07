import { getAllUsers } from "@/lib/actions/admin.actions";
import { UsersTable } from "./_components/users-table";
import { BulkSendNotificationDialog } from "./_components/bulk-send-notification-dialog";

export default async function UsersPage() {
    const users = await getAllUsers();
    const userClerkIds = users.map((u: any) => u.clerkId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h2>
                <BulkSendNotificationDialog
                    userClerkIds={userClerkIds}
                    userCount={users.length}
                />
            </div>
            <UsersTable users={users} />
        </div>
    );
}
