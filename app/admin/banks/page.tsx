import { getBanks } from "@/lib/actions/bank.actions";
import { BankDialog } from "./_components/bank-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import Image from "next/image";

export default async function BanksPage() {
    const banks = await getBanks();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Bank Master Data</h2>
                <BankDialog mode="create" trigger={<Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Bank</Button>} />
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banks.map((bank: any) => (
                            <TableRow key={bank._id}>
                                <TableCell>
                                    {bank.logo ? (
                                        <div className="relative h-8 w-8">
                                            <Image
                                                src={bank.logo}
                                                alt={bank.name}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 bg-slate-100 rounded-full" />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{bank.name}</TableCell>
                                <TableCell>{bank.acceptsOnline ? "Online" : "Offline"}</TableCell>
                                <TableCell className="text-right">
                                    <BankDialog
                                        mode="edit"
                                        bank={bank}
                                        trigger={<Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
