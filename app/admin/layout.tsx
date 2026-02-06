import { checkAdmin } from "@/lib/rbac";
import { AdminSidebar } from "./_components/admin-sidebar";
import { UserButton } from "@clerk/nextjs";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Ensure only admins can access
    await checkAdmin();

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
                    <h1 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 lg:ml-0 ml-12">
                        <span className="hidden sm:inline">Administration</span>
                        <span className="sm:hidden">Admin</span>
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-xs sm:text-sm text-slate-500 hidden sm:block">
                            System Admin
                        </div>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
