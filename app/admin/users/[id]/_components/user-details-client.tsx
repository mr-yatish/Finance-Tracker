"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Landmark, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function UserDetailsClient({ data }: { data: any }) {
    const router = useRouter();
    const { user, transactions, emis, stats } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{user.firstName} {user.lastName}</h2>
                    <p className="text-muted-foreground">{user.email} • {user.role}</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.balance)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.income)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.expense)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {emis.filter((e: any) => e.status === 'active').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="transactions" className="w-full">
                <TabsList>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="loans">Loans (EMI)</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length > 0 ? transactions.map((tx: any) => (
                                        <TableRow key={tx._id}>
                                            <TableCell>{format(new Date(tx.date), "MMM d, yyyy")}</TableCell>
                                            <TableCell className="font-medium">{tx.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{tx.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1 capitalize">
                                                        {tx.paymentMethod === 'online' ? <Landmark className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                                                        {tx.paymentMethod}
                                                    </div>
                                                    {tx.bankAccount && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            {tx.bankAccount.bank?.name} • {tx.bankAccount.last4Digits || '****'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {tx.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(tx.amount)}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No transactions found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="loans" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loans & EMIs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Loan Name</TableHead>
                                        <TableHead>Lender</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {emis.length > 0 ? emis.map((emi: any) => (
                                        <>
                                            <TableRow key={emi._id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                                                const el = document.getElementById(`emi-details-${emi._id}`);
                                                if (el) el.classList.toggle('hidden');
                                            }}>
                                                <TableCell className="font-medium">{emi.name}</TableCell>
                                                <TableCell>{emi.lender}</TableCell>
                                                <TableCell>{emi.loanType}</TableCell>
                                                <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.totalAmount)}</TableCell>
                                                <TableCell className="text-orange-600 font-medium">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.remainingAmount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={emi.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                        {emi.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow id={`emi-details-${emi._id}`} className="hidden bg-muted/30">
                                                <TableCell colSpan={6} className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground block">Monthly EMI</span>
                                                                <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emi.emiAmount)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground block">Start Date</span>
                                                                <span className="font-semibold">{format(new Date(emi.startDate), "MMM d, yyyy")}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground block">Next Payment</span>
                                                                <span className="font-semibold">{emi.nextPaymentDate ? format(new Date(emi.nextPaymentDate), "MMM d, yyyy") : '-'}</span>
                                                            </div>
                                                        </div>

                                                        {emi.schedule && emi.schedule.length > 0 && (
                                                            <div className="mt-6">
                                                                <h4 className="font-semibold mb-2 text-sm">Amortization Schedule</h4>
                                                                <div className="rounded-md border bg-white overflow-hidden">
                                                                    <Table>
                                                                        <TableHeader className="bg-muted/50">
                                                                            <TableRow className="h-9 hover:bg-muted/50">
                                                                                <TableHead className="w-[50px] text-xs font-semibold uppercase">#</TableHead>
                                                                                <TableHead className="text-xs font-semibold uppercase">Date</TableHead>
                                                                                <TableHead className="text-xs font-semibold uppercase text-right">Opening</TableHead>
                                                                                <TableHead className="text-xs font-semibold uppercase text-right">EMI</TableHead>
                                                                                <TableHead className="text-xs font-semibold uppercase text-right">Principal</TableHead>
                                                                                <TableHead className="text-xs font-semibold uppercase text-right">Interest</TableHead>
                                                                                <TableHead className="text-xs font-semibold uppercase text-right">GST</TableHead>
                                                                                <TableHead className="text-xs font-semibold uppercase text-right">Closing</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {emi.schedule.map((row: any) => {
                                                                                const isPaid = row.closingBalance >= emi.remainingAmount;
                                                                                return (
                                                                                    <TableRow key={row.installmentNumber} className={`h-9 border-b border-muted/50 text-xs ${isPaid ? 'bg-emerald-100/50 hover:bg-emerald-100/60' : (row.installmentNumber % 2 === 0 ? 'bg-muted/10' : '')}`}>
                                                                                        <TableCell className="font-medium text-muted-foreground">{row.installmentNumber}</TableCell>
                                                                                        <TableCell className="font-medium">{format(new Date(row.paymentDate), "MMM yyyy")}</TableCell>
                                                                                        <TableCell className="text-right text-muted-foreground">
                                                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.openingBalance)}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right font-bold">
                                                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.emi)}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right text-emerald-600 font-medium">
                                                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.principal)}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right text-rose-500 font-medium">
                                                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.interest)}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right text-orange-500">
                                                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.gst)}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right text-muted-foreground">
                                                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.closingBalance)}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {emi.history && emi.history.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold mb-2 text-sm">Payment History</h4>
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow className="h-8">
                                                                            <TableHead className="py-1">Date</TableHead>
                                                                            <TableHead className="py-1">Amount</TableHead>
                                                                            <TableHead className="py-1">Type</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {emi.history.map((h: any) => (
                                                                            <TableRow key={h._id} className="h-8">
                                                                                <TableCell className="py-1 text-sm">{format(new Date(h.date), "MMM d, yyyy")}</TableCell>
                                                                                <TableCell className="py-1 text-sm">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(h.amount)}</TableCell>
                                                                                <TableCell className="py-1 text-sm capitalize">{h.type}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No loans found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
