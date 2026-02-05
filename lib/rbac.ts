import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Role, Permission, ROLE_PERMISSIONS } from "@/lib/constants/permissions";

export type { Role, Permission };
export { ROLE_PERMISSIONS }; // Re-export for convenience but usage should migrate to direct import for clients

function getRoleFromClaims(sessionClaims: any): string | undefined {
    // configured in Clerk Dashboard as "metadata": "{{user.public_metadata}}"
    return sessionClaims?.metadata?.role;
}

export async function checkAdmin() {
    const { sessionClaims } = await auth();
    const role = getRoleFromClaims(sessionClaims);

    if (role !== 'ADMIN') {
        // Fallback: check database directly (slower but reliable if token fails)
        const { userId } = await auth();
        if (userId) {
            const { getUserById } = await import("@/lib/actions/user.actions");
            const user = await getUserById(userId);
            if (user && user.role === 'ADMIN') {
                return; // Allowed
            }
        }

        redirect('/');
    }
}

export async function hasPermission(permission: Permission): Promise<boolean> {
    const { sessionClaims } = await auth();
    const role = getRoleFromClaims(sessionClaims);

    if (role !== 'ADMIN') {
        return false;
    }

    // Logic to check specific permissions if needed. 
    // For now, if role is ADMIN, return true (Super Admin).
    return true;
}
