import { getAdminLogs } from "@/lib/actions/admin.actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function LogsPage() {
    const logs = await getAdminLogs();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Admin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log: any) => (
                            <TableRow key={log._id}>
                                <TableCell className="whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={log.status === 'FAILURE' ? 'destructive' : 'outline'}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell>{log.entity}</TableCell>
                                <TableCell className="max-w-[300px] truncate text-xs font-mono text-muted-foreground">
                                    {JSON.stringify(log.details)}
                                </TableCell>
                                <TableCell>{log.performedBy}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
