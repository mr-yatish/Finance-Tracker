"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Activity,
    Landmark,
    Settings,
    LogOut,
    Shield
} from "lucide-react";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "System Logs", href: "/admin/logs", icon: Activity },
    { name: "Bank Master", href: "/admin/banks", icon: Landmark },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800">
            <div className="flex items-center justify-center h-16 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <Shield className="w-6 h-6 text-emerald-500" />
                    <span>Admin Portal</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 gap-1 flex flex-col">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Exit Admin
                </Link>
            </div>
        </div>
    );
}
