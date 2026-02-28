import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEmiById, getAmortizationSchedule } from "@/lib/actions/emi.actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, AlertOctagon } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { EmiPaymentModal } from "@/components/shared/EmiPaymentModal";
import { DeleteEmiDialog } from "@/components/shared/DeleteEmiDialog";
import { DeletePaymentButton } from "@/components/shared/DeletePaymentButton";
import { AmortizationExportButton } from "@/components/shared/AmortizationExportButton";


export default async function EmiDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const emi = await getEmiById(params.id);
    const schedule = await getAmortizationSchedule(params.id);

    if (!emi) return <div>EMI Track not found</div>;

    const progress = Math.round(((emi.totalAmount - emi.remainingAmount) / emi.totalAmount) * 100);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/emis">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{emi.name}</h1>
                        <p className="text-muted-foreground">{emi.lender} • {emi.loanType}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-14 md:ml-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${emi.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                        {emi.status.toUpperCase()}
                    </span>
                    <DeleteEmiDialog emiId={emi._id} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="md:col-span-2 bg-card border rounded-xl p-6 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Repayment Progress</span>
                            <span className="font-bold">{progress}% Paid</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.totalAmount - emi.remainingAmount)} Paid</span>
                            <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.remainingAmount)} Remaining</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Loan</p>
                            <p className="text-lg font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.totalAmount)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Interest Rate</p>
                            <p className="text-lg font-semibold text-blue-600">{emi.interestRate}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Monthly EMI</p>
                            <p className="text-lg font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.emiAmount)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tenure</p>
                            <p className="text-lg font-semibold">{emi.tenureMonths} Months</p>
                        </div>
                    </div>

                    {emi.nextPaymentDate && (
                        <div className="bg-secondary/30 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <AlertOctagon className="h-5 w-5 text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm whitespace-nowrap">Next Payment Due</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(emi.nextPaymentDate), 'PPP')}</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto sm:ml-auto">
                                <EmiPaymentModal emi={JSON.parse(JSON.stringify(emi))} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeline / History Mini View */}
                <div className="bg-card border rounded-xl p-6 shadow-sm h-fit">
                    <h3 className="font-semibold mb-4">Recent History</h3>
                    {emi.history && emi.history.length > 0 ? (
                        <div className="space-y-4">
                            {emi.history.slice(-3).reverse().map((h: any, i: number) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium">Payment Received</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(h.date), 'PP')}</p>
                                        <p className="text-sm font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(h.amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                    )}
                </div>
            </div>

            {/* Tabs: Amortization vs Full History */}
            <Tabs defaultValue="schedule" className="w-full">
                <TabsList>
                    <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
                    <TabsTrigger value="history">Payment History</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="mt-4">
                    <div className="flex justify-end mb-2">
                        <AmortizationExportButton
                            schedule={schedule}
                            fileName={`${emi.name.replace(/\s+/g, '_')}_schedule`}
                            nextPaymentDate={emi.nextPaymentDate}
                            status={emi.status}
                            emiAmount={emi.emiAmount}
                            totalAmount={emi.totalAmount}
                            lender={emi.lender}
                            loanType={emi.loanType}
                            loanName={emi.name}
                            interestRate={emi.interestRate}
                            tenureMonths={emi.tenureMonths}
                            paidAmount={emi.totalAmount - emi.remainingAmount}
                            remainingAmount={emi.remainingAmount}
                            progress={progress}
                        />
                    </div>
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] whitespace-nowrap">#</TableHead>
                                    <TableHead className="whitespace-nowrap">Date</TableHead>
                                    <TableHead className="whitespace-nowrap">Opening</TableHead>
                                    <TableHead className="whitespace-nowrap">EMI</TableHead>
                                    <TableHead className="whitespace-nowrap">Principal</TableHead>
                                    <TableHead className="whitespace-nowrap">Interest</TableHead>
                                    <TableHead className="whitespace-nowrap">GST</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Closing</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedule.map((row: any) => {
                                    const rowDate = new Date(row.paymentDate);
                                    const nextDate = emi.nextPaymentDate ? new Date(emi.nextPaymentDate) : null;

                                    const rowMonthKey = rowDate.getMonth() + rowDate.getFullYear() * 12;
                                    const nextMonthKey = nextDate ? nextDate.getMonth() + nextDate.getFullYear() * 12 : -1;

                                    const isPaid = emi.status === 'closed' || (nextMonthKey !== -1 && rowMonthKey < nextMonthKey);
                                    const isNext = emi.status === 'active' && nextMonthKey !== -1 && rowMonthKey === nextMonthKey;

                                    return (
                                        <TableRow key={row.installmentNumber} className={isPaid ? "bg-green-200/50 hover:bg-green-300/50" : isNext ? "bg-amber-100 font-semibold" : ""}>
                                            <TableCell className="whitespace-nowrap">{row.installmentNumber}</TableCell>
                                            <TableCell className="whitespace-nowrap">{format(new Date(row.paymentDate), 'MMM yyyy')}</TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.openingBalance)}</TableCell>
                                            <TableCell className="font-medium whitespace-nowrap">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.emi)}</TableCell>
                                            <TableCell className="text-green-600 whitespace-nowrap">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.principal)}</TableCell>
                                            <TableCell className="text-red-500 whitespace-nowrap">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.interest)}</TableCell>
                                            <TableCell className="text-amber-600 whitespace-nowrap">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.gst || 0)}</TableCell>
                                            <TableCell className="text-right font-bold text-muted-foreground whitespace-nowrap">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.closingBalance)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Interest</TableHead>
                                    <TableHead>Principal</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {emi.history && emi.history.length > 0 ? (
                                    emi.history.slice().reverse().map((h: any) => (
                                        <TableRow key={h._id}>
                                            <TableCell>{format(new Date(h.date), 'PPP')}</TableCell>
                                            <TableCell className="capitalize">{h.type}</TableCell>
                                            <TableCell className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(h.amount)}</TableCell>
                                            <TableCell className="text-red-500">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(h.interestComponent || 0)}</TableCell>
                                            <TableCell className="text-green-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(h.principalComponent || 0)}</TableCell>
                                            <TableCell className="text-right">
                                                <DeletePaymentButton emiId={emi._id} historyId={h._id} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No payment history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
