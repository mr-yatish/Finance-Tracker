"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "@/components/shared/TransactionItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Filter, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TransactionListProps {
    transactions: any[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
    const [filterType, setFilterType] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Get unique categories for filter dropdown
    const categories = Array.from(new Set(transactions.map((tx) => tx.category)));

    // Filtering and Balance Logic
    const filteredTransactionsWithBalance = (() => {
        // Sort ALL transactions by date ascending (with _id as tie-breaker) for stable balance
        const sortedAll = [...transactions].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return a._id.localeCompare(b._id); // Stable tie-breaker
        });

        let runningBalance = 0;
        const allWithBalance = sortedAll.map(tx => {
            if (tx.type === 'income') {
                runningBalance += tx.amount;
            } else {
                runningBalance -= tx.amount;
            }
            return { ...tx, runningBalance };
        });

        // Now filter the ones with balance already attached
        const filtered = allWithBalance.filter((tx) => {
            const matchesType = filterType === "all" || tx.type === filterType;
            const matchesCategory = filterCategory === "all" || tx.category === filterCategory;
            const matchesSearch = searchTerm === "" ||
                tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.category.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesDate = true;
            const txDate = new Date(tx.date);

            if (startDate) {
                matchesDate = matchesDate && txDate >= new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && txDate <= end;
            }

            return matchesType && matchesCategory && matchesSearch && matchesDate;
        });

        // Sort back to descending for display (date DESC, then _id DESC)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateB - dateA;
            return b._id.localeCompare(a._id);
        });
    })();

    const exportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Transaction Report", 14, 22);

        doc.setFontSize(11);
        doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 28);

        if (startDate || endDate) {
            doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'End'}`, 14, 34);
        }

        const tableColumn = ["Date", "Description", "Category", "Type", "Amount", "Balance", "Method"];
        const tableRows = filteredTransactionsWithBalance.map((tx) => {
            return [
                format(new Date(tx.date), "dd/MM/yyyy"),
                tx.description || "-",
                tx.category,
                tx.type.toUpperCase(),
                `${tx.type === 'income' ? '+' : '-'} ${tx.amount}`,
                tx.runningBalance.toFixed(2),
                tx.paymentMethod?.toUpperCase() || "ONLINE"
            ];
        });

        // Add Totals
        const totalIncome = filteredTransactionsWithBalance
            .filter(t => t.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const totalExpense = filteredTransactionsWithBalance
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const balance = totalIncome - totalExpense;

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 163, 74] }, // Greenish header
        });

        // Add Summary at the end
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.text(`Total Income: ${totalIncome.toFixed(2)}`, 14, finalY);
        doc.text(`Total Expense: ${totalExpense.toFixed(2)}`, 14, finalY + 6);
        doc.setFontSize(12);
        doc.setTextColor(balance < 0 ? 220 : 0, balance < 0 ? 0 : 128, 0); // Red or Green
        doc.text(`Net Balance: ${balance.toFixed(2)}`, 14, finalY + 14);

        doc.save("transactions.pdf");
    };

    return (
        <div className="space-y-4">
            {/* Header / Toolbar Area */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border shadow-sm">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-9 h-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Actions Group: Filters & Export */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
                    {/* Type Filter */}
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[130px] h-10">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Category Filter */}
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-[160px] h-10">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Simple Date Range (Collapsed visual on mobile) */}
                    <div className="flex gap-2 items-center">
                        <Input
                            type="date"
                            value={startDate}
                            placeholder="Start"
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full sm:w-[140px] h-10 px-2 text-xs sm:text-sm"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            placeholder="End"
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full sm:w-[140px] h-10 px-2 text-xs sm:text-sm"
                        />
                    </div>

                    {/* Export */}
                    <Button variant="default" onClick={exportPDF} className="h-10 gap-2 whitespace-nowrap bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black">
                        <Download className="h-4 w-4" /> <span className="hidden lg:inline">Export</span>
                    </Button>
                </div>
            </div>

            {/* Results Section */}
            <Card className="rounded-xl border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 py-4 px-6 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {filteredTransactionsWithBalance.length} records
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredTransactionsWithBalance.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <div className="bg-muted/50 p-4 rounded-full mb-3">
                                <Search className="h-6 w-6 opacity-40" />
                            </div>
                            <p>No transactions found.</p>
                            <p className="text-sm mt-1 opacity-70">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {/* Table Header for Column Labels */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <div className="col-span-6">Transaction Details</div>
                                <div className="col-span-3 text-right">Amount</div>
                                <div className="col-span-3 text-right pr-8">Balance</div>
                            </div>
                            {filteredTransactionsWithBalance.map((tx: any) => (
                                <div key={tx._id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <TransactionItem transaction={tx} balance={tx.runningBalance} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

    );
};
