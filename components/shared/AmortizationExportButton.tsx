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
}

export function AmortizationExportButton({ schedule, fileName = "amortization_schedule" }: AmortizationExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        if (!schedule || schedule.length === 0) return;
        setIsExporting(true);

        try {
            // 1. Init PDF
            const doc = new jsPDF();

            // 2. Add Title
            doc.setFontSize(16);
            doc.text("Amortization Schedule", 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 22);

            // 3. Define Columns & Data
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('en-IN', {
                    style: 'decimal',
                    maximumFractionDigits: 0
                }).format(amount);
            };

            const tableColumn = ["#", "Date", "Opening (Rs)", "EMI (Rs)", "Principal (Rs)", "Interest (Rs)", "GST (Rs)", "Closing (Rs)"];
            const tableRows = schedule.map((row) => [
                row.installmentNumber,
                format(new Date(row.paymentDate), 'MMM yyyy'),
                formatCurrency(row.openingBalance),
                formatCurrency(row.emi),
                formatCurrency(row.principal),
                formatCurrency(row.interest),
                formatCurrency(row.gst || 0),
                formatCurrency(row.closingBalance),
            ]);

            // 4. Generate Table
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
                theme: 'grid',
                headStyles: { fillColor: [40, 40, 40] }, // Dark header
                styles: { fontSize: 8, cellPadding: 2 },
            });

            // 5. Save
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
