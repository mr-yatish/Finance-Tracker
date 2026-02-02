"use client";

import { AddBankAccountForm } from "@/components/shared/AddBankAccountForm";
import { Toaster } from "@/components/ui/sonner";

export default function TestFormPage() {
    return (
        <div className="p-10 max-w-md mx-auto border m-10 rounded-lg">
            <h1 className="text-xl font-bold mb-4">Test Bank Form (Click Debug)</h1>
            <AddBankAccountForm onSuccess={() => alert("Success!")} />
            <Toaster />
        </div>
    );
}
