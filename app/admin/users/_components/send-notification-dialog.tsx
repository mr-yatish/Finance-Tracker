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
import { Bell, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { createNotification } from "@/lib/actions/notification.actions";
import { Switch } from "@/components/ui/switch";

interface SendNotificationDialogProps {
    user: any;
}

export function SendNotificationDialog({ user }: SendNotificationDialogProps) {
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

        setLoading(true);

        try {
            const result = await createNotification(user.clerkId, {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                sendPush: formData.sendPush,
            });

            if (result.success) {
                toast.success(`Notification sent to ${user.firstName || user.email}!`, {
                    description: formData.sendPush
                        ? "In-app and push notification delivered"
                        : "In-app notification delivered"
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
                toast.error("Failed to send notification", {
                    description: result.error
                });
            }
        } catch (error: any) {
            toast.error("Error sending notification", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Send Notification</DialogTitle>
                        <DialogDescription>
                            Send a notification to {user.firstName || user.email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Notification title"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="message">Message *</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter your message here..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
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
                                <Label htmlFor="push" className="text-sm font-medium">
                                    Send Push Notification
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Also send as browser push notification (if enabled)
                                </p>
                            </div>
                            <Switch
                                id="push"
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
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Notification
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
