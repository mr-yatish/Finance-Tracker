"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSystemConfig } from "@/lib/actions/admin.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Category {
    name: string;
    type: 'income' | 'expense';
}

interface CategoryEditorProps {
    initialCategories: Category[];
}

export function CategoryConfigEditor({ initialCategories }: CategoryEditorProps) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');
    const [isSaving, setIsSaving] = useState(false);

    const addCategory = () => {
        if (!newName.trim()) return;
        if (categories.some(c => c.name.toLowerCase() === newName.trim().toLowerCase() && c.type === newType)) {
            toast.error("Category already exists");
            return;
        }
        setCategories([...categories, { name: newName.trim(), type: newType }]);
        setNewName("");
    };

    const removeCategory = (index: number) => {
        const newCats = [...categories];
        newCats.splice(index, 1);
        setCategories(newCats);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSystemConfig('TRANSACTION_CATEGORIES', categories, 'List of transaction categories');
            toast.success("Categories saved successfully");
        } catch (error) {
            toast.error("Failed to save categories");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Categories</CardTitle>
                <CardDescription>Manage income and expense categories available in the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Category Name"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <Select value={newType} onValueChange={(val: any) => setNewType(val)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={addCategory} size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 bg-muted/20">
                        <h4 className="text-sm font-semibold mb-3 text-emerald-600">Income Categories</h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.filter(c => c.type === 'income').map((cat, idx) => (
                                <div key={`${cat.name}-income-${idx}`} className="flex items-center gap-1 bg-background border px-3 py-1 rounded-full text-sm">
                                    <span>{cat.name}</span>
                                    <button
                                        onClick={() => removeCategory(categories.findIndex(c => c === cat))}
                                        className="text-muted-foreground hover:text-destructive ml-1"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border rounded-md p-4 bg-muted/20">
                        <h4 className="text-sm font-semibold mb-3 text-rose-600">Expense Categories</h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.filter(c => c.type === 'expense').map((cat, idx) => (
                                <div key={`${cat.name}-expense-${idx}`} className="flex items-center gap-1 bg-background border px-3 py-1 rounded-full text-sm">
                                    <span>{cat.name}</span>
                                    <button
                                        onClick={() => removeCategory(categories.findIndex(c => c === cat))}
                                        className="text-muted-foreground hover:text-destructive ml-1"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
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
