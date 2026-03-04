import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border shadow-sm">
                <Skeleton className="h-10 w-full md:max-w-xs" />
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
                    <Skeleton className="h-10 w-[130px]" />
                    <Skeleton className="h-10 w-[160px]" />
                    <div className="flex gap-2 items-center">
                        <Skeleton className="h-10 w-[140px]" />
                        <Skeleton className="h-10 w-[140px]" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            <Card className="rounded-xl border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 py-4 px-6 border-b">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
