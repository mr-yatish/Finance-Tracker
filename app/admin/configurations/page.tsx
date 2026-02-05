import { getSystemConfig } from "@/lib/actions/admin.actions";
import { ConfigListEditor } from "./_components/config-list-editor";
import { CategoryConfigEditor } from "./_components/category-config-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ConfigurationsPage() {
    // Fetch initial data
    const loanTypesConfig = await getSystemConfig('LOAN_TYPES');
    const categoriesConfig = await getSystemConfig('TRANSACTION_CATEGORIES');

    // Default defaults if not set in DB
    const defaultLoanTypes = [
        'Home Loan', 'Personal Loan', 'Vehicle Loan', 'Education Loan',
        'Credit Card', 'BNPL', 'Informal', 'Other'
    ];

    // Default categories (example set)
    const defaultCategories = [
        { name: 'Salary', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Investments', type: 'income' },
        { name: 'Food', type: 'expense' },
        { name: 'Rent', type: 'expense' },
        { name: 'Utilities', type: 'expense' },
        { name: 'Transportation', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Health', type: 'expense' },
        { name: 'Shopping', type: 'expense' },
    ];

    const loanTypes = loanTypesConfig?.value || defaultLoanTypes;
    const categories = categoriesConfig?.value || defaultCategories;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Configurations</h2>
                <p className="text-muted-foreground">Manage global system options and details.</p>
            </div>

            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="loantypes">Loan Types</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="mt-6">
                    <CategoryConfigEditor initialCategories={categories} />
                </TabsContent>

                <TabsContent value="loantypes" className="mt-6">
                    <ConfigListEditor
                        configKey="LOAN_TYPES"
                        title="Loan Types"
                        description="Define the types of loans available for selection."
                        initialItems={loanTypes}
                        placeholder="e.g. Mortgage"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
