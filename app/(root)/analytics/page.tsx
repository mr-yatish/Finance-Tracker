import { auth, currentUser } from "@clerk/nextjs/server";
import { getAnalyticsData } from "@/lib/actions/transaction.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/shared/AnalyticsCharts";

export default async function AnalyticsPage() {
    const user = await currentUser();
    if (!user) return null;

    const { categoryStats, monthlyStats, paymentMethodStats, bankStats } = await getAnalyticsData(user.id);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl border-none shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnalyticsCharts type="pie" data={categoryStats || []} />
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnalyticsCharts type="bar" data={monthlyStats || []} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl border-none shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnalyticsCharts type="pie" data={paymentMethodStats || []} />
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle>Bank Account Spending (Online)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnalyticsCharts type="pie" data={bankStats || []} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
