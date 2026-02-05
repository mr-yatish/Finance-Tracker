import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <Hammer className="h-10 w-10 text-slate-900 dark:text-slate-100" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
        We are currently under maintenance
      </h1>
      <p className="mb-8 max-w-md text-slate-600 dark:text-slate-400">
        We're checking underneath the hood. We should be back shortly. Thank you for your patience.
      </p>
    </div>
  );
}
