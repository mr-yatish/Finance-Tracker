import { Tabs, TabsList } from "@/components/ui/tabs";
import { getAdminLogs, getSystemLogs } from "@/lib/actions/admin.actions";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SystemLogsFilter } from "./_components/system-logs-filter";

interface LogsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LogsPage(props: LogsPageProps) {
    const searchParams = await props.searchParams;
    const activeTab = typeof searchParams?.tab === 'string' ? searchParams.tab : 'system';
    const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;

    // Filters
    const filters = {
        search: typeof searchParams?.search === 'string' ? searchParams.search : undefined,
        level: typeof searchParams?.level === 'string' ? searchParams.level : undefined,
        action: typeof searchParams?.action === 'string' ? searchParams.action : undefined,
        page,
        limit: 20
    };

    // Conditional Fetch
    let data;
    if (activeTab === 'system') {
        data = await getSystemLogs(filters);
    } else {
        data = await getAdminLogs(filters);
    }

    const { logs = [], totalPages = 1, currentPage = 1 } = data || {};

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Logs</h2>
            </div>

            <Tabs defaultValue={activeTab} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <TabsList className="w-full sm:w-auto">
                        {/* Tab Switchers as Forms/Buttons to keep server state */}
                        <form action="">
                            <input type="hidden" name="tab" value="system" />
                            <input type="hidden" name="page" value="1" />
                            <button type="submit" className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${activeTab === 'system' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                System Logs
                            </button>
                        </form>
                        <form action="" className="ml-2">
                            <input type="hidden" name="tab" value="audit" />
                            <input type="hidden" name="page" value="1" />
                            <button type="submit" className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${activeTab === 'audit' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                Admin Audit
                            </button>
                        </form>
                    </TabsList>
                </div>

                <SystemLogsFilter type={activeTab as 'system' | 'audit'} />

                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Level / Status</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Message / Entity</TableHead>
                                <TableHead>User</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length > 0 ? (
                                logs.map((log: any) => (
                                    <TableRow key={log._id}>
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {new Date(log.createdAt || log.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {activeTab === 'system' ? (
                                                <Badge variant={
                                                    log.level === 'ERROR' ? 'destructive' :
                                                        log.level === 'WARN' ? 'secondary' : 'outline'
                                                }>
                                                    {log.level}
                                                </Badge>
                                            ) : (
                                                <Badge variant={log.status === 'FAILURE' ? 'destructive' : 'outline'}>
                                                    {log.status || 'SUCCESS'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">{log.action}</TableCell>
                                        <TableCell className="max-w-[400px] text-xs font-mono text-muted-foreground">
                                            {activeTab === 'system' ? (
                                                <div>
                                                    <div className="font-semibold text-foreground">{log.message}</div>
                                                    {log.details && <div className="truncate mt-1">{JSON.stringify(log.details)}</div>}
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-semibold text-foreground">{log.entity}</div>
                                                    {log.details && <div className="truncate mt-1">{JSON.stringify(log.details)}</div>}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs">{log.userId || log.performedBy || 'System'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <PaginationControls totalPages={totalPages} currentPage={currentPage} />
            </Tabs>
        </div>
    );
}
