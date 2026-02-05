"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SystemLogsFilterProps {
    type: 'audit' | 'system';
}

export function SystemLogsFilter({ type }: SystemLogsFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [level, setLevel] = useState(searchParams.get("level") || "ALL");

    useEffect(() => {
        const handler = setTimeout(() => {
            updateFilters({ search });
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const updateFilters = (updates: { search?: string; level?: string }) => {
        const params = new URLSearchParams(searchParams.toString());

        if (updates.search !== undefined) {
            if (updates.search) params.set("search", updates.search);
            else params.delete("search");
        }
        if (updates.level) {
            if (updates.level !== "ALL") params.set("level", updates.level);
            else params.delete("level");
        }

        // Always reset page to 1 when filtering
        params.set("page", "1");

        router.push(`/admin/logs?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearch("");
        setLevel("ALL");
        // Keep the tab but reset other filters including page
        const params = new URLSearchParams(searchParams.toString());
        params.delete("search");
        params.delete("level");
        params.delete("action");
        params.set("page", "1");

        router.push(`/admin/logs?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-card p-4 rounded-lg border mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search messages, actions, user IDs..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Select value={level} onValueChange={(val) => { setLevel(val); updateFilters({ level: val }); }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Levels</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARN">Warn</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="DEBUG">Debug</SelectItem>
                </SelectContent>
            </Select>

            {(search || level !== "ALL") && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
