"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleMaintenanceMode } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function MaintenanceToggle({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setLoading(true);
        try {
            const res = await toggleMaintenanceMode(checked);
            setEnabled(checked);
            toast.success(res.message);
        } catch (error) {
            toast.error("Failed to toggle maintenance mode");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900/50">
            <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                    <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-400">Maintenance Mode</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Switch id="maintenance-mode" checked={enabled} onCheckedChange={handleToggle} disabled={loading} />
                    <Label htmlFor="maintenance-mode" className="text-sm text-orange-700 dark:text-orange-400">
                        {enabled ? "System is undergoing maintenance" : "System is live"}
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}
