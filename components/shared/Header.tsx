"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

export default function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 lg:justify-end">
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="flex h-14 items-center border-b px-4">
                            <Link href="/" className="flex items-center gap-2 font-semibold">
                                <span className="text-xl font-bold text-primary">FinanceTrack</span>
                            </Link>
                        </div>
                        <nav className="flex flex-col space-y-2 p-4">
                            <Button variant="ghost" className="justify-start gap-2" asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start gap-2" asChild>
                                <Link href="/transactions">Transactions</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start gap-2" asChild>
                                <Link href="/analytics">Analytics</Link>
                            </Button>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex items-center gap-4">
                <ModeToggle />
                <UserButton />
            </div>
        </header>
    );
}
