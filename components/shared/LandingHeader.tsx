"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function LandingHeader() {
    const [sheetOpen, setSheetOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <img src="/images/logo.png" alt="Daily Budget" className="h-20 w-auto" />
                    <span className="text-lg font-bold font-[family-name:var(--font-outfit)]">Daily Budget</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <ModeToggle />
                    <Button variant="ghost" asChild>
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/sign-up">Get Started</Link>
                    </Button>
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center gap-2">
                    <ModeToggle />
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetTitle className="hidden">Navigation Menu</SheetTitle>
                            <div className="flex flex-col gap-6 mt-8">
                                <div className="flex items-center gap-2 font-bold text-xl justify-center">
                                    <img src="/images/logo.png" alt="Daily Budget" className="h-12 w-auto" />
                                    <span className="font-[family-name:var(--font-outfit)]">Daily Budget</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Button variant="outline" className="w-full justify-start text-lg h-12" asChild>
                                        <Link href="/sign-in" onClick={() => setSheetOpen(false)}>Login</Link>
                                    </Button>
                                    <Button className="w-full justify-start text-lg h-12" asChild>
                                        <Link href="/sign-up" onClick={() => setSheetOpen(false)}>Get Started</Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
