import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEmisByUser } from "@/lib/actions/emi.actions";
import { fetchBudgetSummary } from "@/lib/actions/budget.actions";
import { getUserBankAccounts } from "@/lib/actions/bank.actions";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, TrendingDown, DollarSign, Calendar } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { EmiForm } from "@/components/shared/EmiForm";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default async function EmiPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const emis = await getEmisByUser(user.id);
    const budget = await fetchBudgetSummary(user.id);
    const accounts = await getUserBankAccounts(user.id);

    const activeEmis = emis.filter((e: any) => e.status === 'active');
    const totalDebt = activeEmis.reduce((sum: number, e: any) => sum + e.remainingAmount, 0);
    const monthlyCommitment = activeEmis.reduce((sum: number, e: any) => sum + e.emiAmount, 0);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Loan Tracks & EMI</h1>
                    <p className="text-muted-foreground">Manage your debts and track repayment progress.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add New Loan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-full">
                        <DialogHeader>
                            <DialogTitle>Add New Loan</DialogTitle>
                            <DialogDescription>
                                Enter details to start tracking your EMI.
                            </DialogDescription>
                        </DialogHeader>
                        <EmiForm userId={user.id} bankAccounts={accounts} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Budget Impact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-card border rounded-xl shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Total Active Debt</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalDebt)}
                    </div>
                </div>

                <div className="p-6 bg-card border rounded-xl shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">Monthly EMI Outflow</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(monthlyCommitment)}
                    </div>
                </div>

                <div className="p-6 bg-card border rounded-xl shadow-sm space-y-2 col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <AlertTriangle className={budget?.overLeveraged ? "text-red-500 h-4 w-4" : "text-green-500 h-4 w-4"} />
                        <span className="text-sm font-medium">Budget Health</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-2xl font-bold">
                                {budget?.overLeveraged ? "Over-Leveraged" : "Healthy"}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                EMIs take up <span className="font-semibold text-foreground">
                                    {Math.round((budget?.totalEmiObligation / (budget?.monthlyIncome || 1)) * 100) || 0}%
                                </span> of your monthly income.
                            </p>
                        </div>
                    </div>
                    {/* Progress Bar for Debt/Income Ratio */}
                    <div className="mt-3">
                        <Progress value={Math.min(100, Math.round((budget?.totalEmiObligation / (budget?.monthlyIncome || 1)) * 100) || 0)}
                            className={budget?.overLeveraged ? "[&>div]:bg-red-500 bg-red-100" : ""} />
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Active Loans</h2>

                {activeEmis.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground mb-4">No active loans found. Stay debt-free or track existing ones.</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Track a Loan</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <EmiForm userId={user.id} bankAccounts={accounts} />
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeEmis.map((emi: any) => {
                            const progress = Math.round(((emi.totalAmount - emi.remainingAmount) / emi.totalAmount) * 100);

                            return (
                                <Link href={`/emis/${emi._id}`} key={emi._id} className="block group">
                                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{emi.name}</h3>
                                                <p className="text-sm text-muted-foreground">{emi.lender} • {emi.loanType}</p>
                                            </div>
                                            <div className="bg-secondary px-2 py-1 rounded text-xs font-medium">
                                                {progress}% Paid
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">EMI Amount</span>
                                                <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.emiAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Remaining</span>
                                                <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.remainingAmount)}</span>
                                            </div>

                                            <div className="flex justify-between text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Next Due</span>
                                                <span>{format(new Date(emi.nextPaymentDate), 'PPP')}</span>
                                            </div>

                                            <Progress value={progress} className="h-2" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
