import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { log } from "node:console";

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/transactions(.*)']);
const isMaintenanceRoute = createRouteMatcher(['/maintenance']);

export default clerkMiddleware(async (auth, req) => {
    // Check for maintenance mode
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

    if (isMaintenanceMode) {
        // Allow access to the maintenance page itself
        if (isMaintenanceRoute(req)) {
            return NextResponse.next();
        }

        // Redirect all other traffic to maintenance page
        return NextResponse.redirect(new URL('/maintenance', req.url));
    } else {
        // If not in maintenance mode, but trying to access maintenance page, redirect to home
        if (isMaintenanceRoute(req)) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    const isAdminRoute = createRouteMatcher(['/admin(.*)']);

    if (isAdminRoute(req)) {
        await auth.protect();

        const { sessionClaims } = await auth();
        // Check both locations for metadata
        // @ts-ignore
        const role = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;

        if (role !== 'ADMIN') {
            // const url = new URL('/dashboard', req.url);
            // return NextResponse.redirect(url);
        }
    }

    if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
