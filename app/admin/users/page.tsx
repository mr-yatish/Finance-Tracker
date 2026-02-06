import { getAllUsers } from "@/lib/actions/admin.actions";
import { UsersTable } from "./_components/users-table";

export default async function UsersPage() {
    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h2>
            </div>
            <UsersTable users={users} />
        </div>
    );
}
