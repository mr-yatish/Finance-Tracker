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
    Shield,
    Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "System Logs", href: "/admin/logs", icon: Activity },
    { name: "Bank Master", href: "/admin/banks", icon: Landmark },
    { name: "Configurations", href: "/admin/configurations", icon: Settings },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();

    return (
        <>
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
                            onClick={onLinkClick}
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
                    onClick={onLinkClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Exit Admin
                </Link>
            </div>
        </>
    );
}

export function AdminSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
                    <Button variant="outline" size="icon" className="bg-slate-900 text-white border-slate-700 hover:bg-slate-800">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-slate-900 text-white border-slate-800">
                    <VisuallyHidden>
                        <SheetTitle>Admin Navigation Menu</SheetTitle>
                    </VisuallyHidden>
                    <div className="flex flex-col h-full">
                        <SidebarContent onLinkClick={() => setOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800">
                <SidebarContent />
            </div>
        </>
    );
}
