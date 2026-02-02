"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Menu, BarChart3, ArrowRight, TrendingUp, BrainCircuit, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

export default function Header() {
    const [sheetOpen, setSheetOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
                <div className="lg:hidden">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col w-72 p-0">
                            <SheetTitle className="hidden">Navigation Menu</SheetTitle>
                            <div className="flex h-20 items-center justify-center border-b px-6">
                                <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setSheetOpen(false)}>
                                    <img src="/images/logo.png" alt="Daily Budget" className="h-24 w-auto" />
                                    {/* <span className="text-xl font-bold text-primary font-[family-name:var(--font-outfit)]">Daily Budget</span> */}
                                </Link>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-6">
                                <nav className="flex flex-col space-y-4">
                                    <Button variant="ghost" className="justify-start gap-3 h-12 text-base font-medium" asChild>
                                        <Link href="/dashboard" onClick={() => setSheetOpen(false)}>
                                            <span className="bg-primary/10 p-2 rounded-md"><BarChart3 className="h-4 w-4 text-primary" /></span>
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-3 h-12 text-base font-medium" asChild>
                                        <Link href="/transactions" onClick={() => setSheetOpen(false)}>
                                            <span className="bg-primary/10 p-2 rounded-md"><ArrowRight className="h-4 w-4 text-primary" /></span>
                                            Transactions
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-3 h-12 text-base font-medium" asChild>
                                        <Link href="/analytics" onClick={() => setSheetOpen(false)}>
                                            <span className="bg-primary/10 p-2 rounded-md"><TrendingUp className="h-4 w-4 text-primary" /></span>
                                            Analytics
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-3 h-12 text-base font-medium" asChild>
                                        <Link href="/ai-chat" onClick={() => setSheetOpen(false)}>
                                            <span className="bg-primary/10 p-2 rounded-md"><BrainCircuit className="h-4 w-4 text-primary" /></span>
                                            AI Chat
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-3 h-12 text-base font-medium" asChild>
                                        <Link href="/user-profile" onClick={() => setSheetOpen(false)}>
                                            <span className="bg-primary/10 p-2 rounded-md"><Settings className="h-4 w-4 text-primary" /></span>
                                            Settings
                                        </Link>
                                    </Button>
                                </nav>
                            </div>
                            <div className="border-t p-6">
                                <p className="text-xs text-center text-muted-foreground">
                                    © {new Date().getFullYear()} Daily Budget
                                </p>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                <Link href="/" className="flex lg:hidden items-center gap-2 font-semibold">
                    <img src="/images/logo.png" alt="Daily Budget" className="h-20 w-auto" />
                    <span className="text-lg font-bold text-primary font-[family-name:var(--font-outfit)]">Daily Budget</span>
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <ModeToggle />
                <UserButton />
            </div>
        </header>
    );
}
