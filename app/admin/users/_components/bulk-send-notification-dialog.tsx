"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Bell, Loader2, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { sendBulkNotification } from "@/lib/actions/notification.actions";
import { Switch } from "@/components/ui/switch";

interface BulkSendNotificationDialogProps {
    userClerkIds: string[];
    userCount: number;
}

export function BulkSendNotificationDialog({ userClerkIds, userCount }: BulkSendNotificationDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "From Finance Tracker",
        message: "",
        type: "alert" as "transaction" | "emi" | "budget" | "bank" | "alert" | "reminder",
        sendPush: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        if (userClerkIds.length === 0) {
            toast.error("No users to send notification to");
            return;
        }

        setLoading(true);

        try {
            const result = await sendBulkNotification(userClerkIds, {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                sendPush: formData.sendPush,
            });

            if (result.success && result.results) {
                toast.success(`Notifications sent!`, {
                    description: `Successfully sent to ${result.results.success} users${result.results.failed > 0 ? `, ${result.results.failed} failed` : ''}`
                });
                setOpen(false);
                // Reset form
                setFormData({
                    title: "From Finance Tracker",
                    message: "",
                    type: "alert",
                    sendPush: true,
                });
            } else {
                toast.error("Failed to send notifications", {
                    description: result.error
                });
            }
        } catch (error: any) {
            toast.error("Error sending notifications", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Bell className="h-4 w-4 mr-2" />
                    Send to All Users
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Send Bulk Notification</DialogTitle>
                        <DialogDescription>
                            Send a notification to all {userCount} users
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                This will send notification to <strong>{userCount}</strong> users
                            </span>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bulk-title">Title</Label>
                            <Input
                                id="bulk-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Notification title"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bulk-message">Message *</Label>
                            <Textarea
                                id="bulk-message"
                                value={formData.message}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter your message here..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bulk-type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="alert">⚠️ Alert</SelectItem>
                                    <SelectItem value="reminder">🔔 Reminder</SelectItem>
                                    <SelectItem value="transaction">💰 Transaction</SelectItem>
                                    <SelectItem value="emi">📅 EMI</SelectItem>
                                    <SelectItem value="budget">📉 Budget</SelectItem>
                                    <SelectItem value="bank">🏦 Bank</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="bulk-push" className="text-sm font-medium">
                                    Send Push Notification
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Also send as browser push notification (if enabled)
                                </p>
                            </div>
                            <Switch
                                id="bulk-push"
                                checked={formData.sendPush}
                                onCheckedChange={(checked) => setFormData({ ...formData, sendPush: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending to {userCount} users...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send to All
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
