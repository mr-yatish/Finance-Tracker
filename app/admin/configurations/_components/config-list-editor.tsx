"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSystemConfig } from "@/lib/actions/admin.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfigListEditorProps {
    configKey: string;
    title: string;
    description: string;
    initialItems: string[];
    placeholder?: string;
}

export function ConfigListEditor({ configKey, title, description, initialItems, placeholder }: ConfigListEditorProps) {
    const [items, setItems] = useState<string[]>(initialItems);
    const [newItem, setNewItem] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const addItem = () => {
        if (!newItem.trim()) return;
        if (items.includes(newItem.trim())) {
            toast.error("Item already exists");
            return;
        }
        setItems([...items, newItem.trim()]);
        setNewItem("");
    };

    const removeItem = (itemToRemove: string) => {
        setItems(items.filter(item => item !== itemToRemove));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSystemConfig(configKey, items, description);
            toast.success("Configuration saved successfully");
        } catch (error) {
            toast.error("Failed to save configuration");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder || "Add new item..."}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    />
                    <Button onClick={addItem} size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[100px] border rounded-md p-4 bg-muted/20">
                    {items.length === 0 && <p className="text-muted-foreground text-sm italic">No items defined.</p>}
                    {items.map((item) => (
                        <div key={item} className="flex items-center gap-1 bg-background border px-3 py-1 rounded-full text-sm">
                            <span>{item}</span>
                            <button onClick={() => removeItem(item)} className="text-muted-foreground hover:text-destructive ml-1">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
