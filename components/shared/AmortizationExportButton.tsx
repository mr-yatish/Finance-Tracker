"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

interface AmortizationExportButtonProps {
    schedule: any[];
    fileName?: string;
    nextPaymentDate?: string | Date;
    status?: string;
    emiAmount?: number;
    totalAmount?: number;
    lender?: string;
    loanType?: string;
    loanName?: string;
    interestRate?: number;
    tenureMonths?: number;
    paidAmount?: number;
    remainingAmount?: number;
    progress?: number;
}

export function AmortizationExportButton({
    schedule,
    fileName = "amortization_schedule",
    nextPaymentDate,
    status,
    emiAmount,
    totalAmount,
    lender,
    loanType,
    loanName,
    interestRate,
    tenureMonths,
    paidAmount,
    remainingAmount,
    progress
}: AmortizationExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        if (!schedule || schedule.length === 0) return;
        setIsExporting(true);

        try {
            // 1. Init PDF
            const doc = new jsPDF();

            // 3. Define Columns & Data
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('en-IN', {
                    style: 'decimal',
                    maximumFractionDigits: 0
                }).format(amount);
            };

            let nextEmiRow: any = null;
            const tableRows = schedule.map((row) => {
                const rowDate = new Date(row.paymentDate);
                const nextDate = nextPaymentDate ? new Date(nextPaymentDate) : null;

                const rowMonthKey = rowDate.getMonth() + rowDate.getFullYear() * 12;
                const nextMonthKey = nextDate ? nextDate.getMonth() + nextDate.getFullYear() * 12 : -1;

                let rowStatus = "";
                const isNext = status === 'active' && nextMonthKey !== -1 && rowMonthKey === nextMonthKey;
                const isPaid = status === 'closed' || (nextMonthKey !== -1 && rowMonthKey < nextMonthKey);

                if (isPaid) rowStatus = "Paid";
                else if (isNext) {
                    rowStatus = "Next";
                    nextEmiRow = row;
                }

                return [
                    row.installmentNumber,
                    format(rowDate, 'MMM yyyy'),
                    formatCurrency(row.openingBalance),
                    formatCurrency(row.emi),
                    formatCurrency(row.principal),
                    formatCurrency(row.interest),
                    formatCurrency(row.gst || 0),
                    formatCurrency(row.closingBalance),
                    rowStatus
                ];
            });

            const displayEmiAmount = nextEmiRow ? nextEmiRow.emi : (emiAmount || 0);

            // 2. Add Header Info
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 40);
            doc.text("EMI History", 14, 15);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 22);

            // 2.1 Add Summary Box
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(245, 245, 245);
            doc.rect(14, 28, 182, 65, 'FD'); // Increased height to 65

            // Progress Bar Logic
            const progressVal = progress || 0;
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text("Repayment Progress", 20, 36);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text(`${progressVal}% Paid`, 175, 36, { align: 'right' });

            // Draw Progress Bar
            doc.setDrawColor(230, 230, 230);
            doc.setFillColor(230, 230, 230);
            doc.rect(20, 39, 170, 3, 'F'); // Background
            doc.setFillColor(249, 115, 22); // Orange progress color
            doc.rect(20, 39, 1.7 * progressVal, 3, 'F'); // Foreground

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Rs. ${formatCurrency(paidAmount || 0)} Paid`, 20, 47);
            doc.text(`Rs. ${formatCurrency(remainingAmount || 0)} Remaining`, 175, 47, { align: 'right' });

            // Divider Line
            doc.setDrawColor(220, 220, 220);
            doc.line(20, 52, 190, 52);

            // Row 2: Detailed Stats
            doc.setFontSize(8);
            doc.text("Total Loan", 20, 58);
            doc.text("Interest Rate", 65, 58);
            doc.text("Monthly EMI", 110, 58);
            doc.text("Tenure", 155, 58);

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text(`Rs. ${formatCurrency(totalAmount || 0)}`, 20, 64);
            doc.setTextColor(37, 99, 235); // Blue for Interest
            doc.text(`${interestRate}%`, 65, 64);
            doc.setTextColor(0, 0, 0);
            doc.text(`Rs. ${formatCurrency(emiAmount || 0)}`, 110, 64);
            doc.text(`${tenureMonths} Months`, 155, 64);

            // Row 3: Loan Name & Lender
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            const loanInfo = `Loan: ${loanName || 'N/A'}  |  Lender: ${lender || 'N/A'}  |  Type: ${loanType || 'N/A'}`;
            doc.text(loanInfo, 20, 72);

            // Next Payment Row (Distinct)
            doc.setFont("helvetica", "bold");
            doc.setTextColor(37, 99, 235);
            const nextPayText = `Next Payment: Rs. ${formatCurrency(displayEmiAmount)} on ${nextPaymentDate ? format(new Date(nextPaymentDate), 'PPP') : 'N/A'}`;
            doc.text(nextPayText, 20, 80);
            doc.setTextColor(0, 0, 0);

            const tableColumn = ["#", "Date", "Opening (Rs)", "EMI (Rs)", "Principal (Rs)", "Interest (Rs)", "GST (Rs)", "Closing (Rs)", "Status"];

            // 4. Generate Table
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 100,
                theme: 'grid',
                headStyles: { fillColor: [40, 40, 40] }, // Dark header
                styles: { fontSize: 8, cellPadding: 2 },
                didParseCell: (data) => {
                    if (data.section === 'body') {
                        const rowDate = new Date(schedule[data.row.index].paymentDate);
                        const nextDate = nextPaymentDate ? new Date(nextPaymentDate) : null;

                        const rowMonthKey = rowDate.getMonth() + rowDate.getFullYear() * 12;
                        const nextMonthKey = nextDate ? nextDate.getMonth() + nextDate.getFullYear() * 12 : -1;

                        const isNext = status === 'active' && nextMonthKey !== -1 && rowMonthKey === nextMonthKey;
                        const isPaid = status === 'closed' || (nextMonthKey !== -1 && rowMonthKey < nextMonthKey);

                        if (isPaid) {
                            data.cell.styles.fillColor = [200, 230, 201]; // Light Green
                        } else if (isNext) {
                            data.cell.styles.fillColor = [255, 236, 179]; // Light Amber
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            // 5. Add Legend
            const finalY = ((doc as any).lastAutoTable?.finalY || 200) + 10;
            doc.setFontSize(10);

            doc.setFillColor(200, 230, 201);
            doc.rect(14, finalY, 5, 5, 'F');
            doc.text("Paid EMI", 22, finalY + 4);

            doc.setFillColor(255, 236, 179);
            doc.rect(50, finalY, 5, 5, 'F');
            doc.text("Next EMI Due", 58, finalY + 4);

            // 6. Save
            doc.save(`${fileName}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error", error);
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export PDF
        </Button>
    );
}
