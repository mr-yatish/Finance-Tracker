"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Settings, PieChart, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
    {
        label: "Dashboard",
        route: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Transactions",
        route: "/transactions",
        icon: Receipt,
    },
    {
        label: "Analytics",
        route: "/analytics",
        icon: PieChart,
    },
    {
        label: "AI Chat",
        route: "/ai-chat",
        icon: BrainCircuit,
    },
    {
        label: "Settings",
        route: "/user-profile",
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden h-screen w-64 flex-col bg-background/50 backdrop-blur-xl border-r lg:flex">
            <div className="flex h-24 items-center px-6 border-b border-border/40">
                <Link href="/dashboard" className="flex items-center">
                    <img src="/images/logo.png" alt="Daily Budget" className="h-20 w-auto mr-3" />
                    <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">Daily Budget</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.route || pathname.startsWith(`${link.route}/`);
                    return (
                        <Link
                            key={link.route}
                            href={link.route}
                            className={cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <link.icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    );
                })}
                {/* <Link
                    href="/user-profile"
                    className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        pathname === "/user-profile"
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link> */}
            </nav>
            <div className="p-4 border-t border-border/40">
                <div className="rounded-2xl bg-card p-4 shadow-sm border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                            <span className="font-bold">?</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Need Help?</p>
                            <p className="text-xs text-muted-foreground">Check docs</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                        <Link href="#">Documentation</Link>
                    </Button>
                </div>
            </div>
        </aside>
    );
}
