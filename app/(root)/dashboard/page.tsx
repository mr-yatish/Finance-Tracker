import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { createUser } from "@/lib/actions/user.actions";
import { getSummaryStats } from "@/lib/actions/transaction.actions";
import { SpendingChart } from "@/components/shared/SpendingChart";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // Sync user to DB
    await createUser({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photo: user.imageUrl
    });

    const { balance, income, expense, chartData, recentTransactions } = await getSummaryStats(user.id);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your financial activity</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full bg-card shadow-sm border">
                        Welcome, {user.firstName || 'User'}
                    </Badge>
                    {/* Placeholder for settings or date picker */}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="rounded-3xl border-none shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center p-1.5">
                            <CreditCard className="h-full w-full text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-extrabold ${balance < 0 ? 'text-destructive' : 'text-foreground'}`}>₹{balance.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Current financial status</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center p-1.5">
                            <TrendingUp className="h-full w-full text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-emerald-500">+₹{income.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Total earnings</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center p-1.5">
                            <TrendingDown className="h-full w-full text-destructive" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-destructive">-₹{expense.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Total spending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-7">
                {/* Chart Section */}
                <Card className="col-span-full lg:col-span-5 rounded-3xl border-none shadow-sm bg-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold">Activity</CardTitle>
                            <Badge variant="outline" className="rounded-full font-normal">Last 6 Months</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <SpendingChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Top Performers / Recent - Mocked for visual matching */}
                <Card className="col-span-full lg:col-span-2 rounded-3xl border-none shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Top Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentTransactions.slice(0, 4).map((tx: any, i: number) => (
                                <div key={tx._id || i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold ${i % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                                            {tx.description?.[0]?.toUpperCase() || 'T'}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium leading-none">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">@{tx.category}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(0)}
                                    </div>
                                </div>
                            ))}
                            {recentTransactions.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}

                            <div className="pt-2">
                                <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">View More &gt;</Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Channels / Accounts - Visual Polish */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="rounded-3xl border-none shadow-sm bg-linear-to-br from-primary/80 to-primary p-6 text-primary-foreground">
                    <div className="space-y-2">
                        <p className="text-sm font-medium opacity-80">Total Savings</p>
                        <p className="text-2xl font-bold">₹12,450</p>
                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none mt-2">+2.5%</Badge>
                    </div>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-card p-6 flex flex-col justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Cash Flow</p>
                        <p className="text-xl font-bold">₹4,200</p>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[70%]" />
                    </div>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-card p-6 flex flex-col justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Investment</p>
                        <p className="text-xl font-bold">₹5,800</p>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-blue-500 w-[40%]" />
                    </div>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-secondary/50 p-6 flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                    <div className="text-center space-y-2">
                        <div className="mx-auto h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium">Add Account</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
