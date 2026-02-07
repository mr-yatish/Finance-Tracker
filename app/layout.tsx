import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { createUser } from "@/lib/actions/user.actions";

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable");
}

import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import NotificationToast from "@/components/shared/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Daily Budget | Master Your Money",
    template: "%s | Daily Budget",
  },
  description: "The modern way to track expenses, visualize income, and achieve your financial goals. Simple, secure, and beautiful.",
  metadataBase: new URL("https://www.dailybudget.in"),
  keywords: ["finance", "budget", "expense tracker", "money management", "personal finance", "daily budget"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.dailybudget.in",
    title: "Daily Budget | Master Your Money",
    description: "Track your income and expenses with ease.",
    siteName: "Daily Budget",
  },
  icons: {
    icon: "/images/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  if (user) {
    try {
      await createUser({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        username: user.username || `user_${user.id.slice(0, 8)}`,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        photo: user.imageUrl,
      });
    } catch (error) {
      console.error("Error syncing user in RootLayout:", error);
      // Don't block the UI if user sync fails, just log it.
    }
  }

  // Check for maintenance mode
  let isMaintenanceMode = false;
  try {
    const { getMaintenanceStatus } = await import("@/lib/actions/admin.actions");
    isMaintenanceMode = await getMaintenanceStatus();
  } catch (e) {
    console.error("Failed to check maintenance status", e);
  }

  // Check if user is admin
  let isAdmin = false;
  try {
    if (user) {
      // Robust check for admin role
      // @ts-ignore
      const metadataRole = user.publicMetadata?.role;
      // You can also check db user here if needed, but metadata is faster
      if (metadataRole === 'ADMIN') {
        isAdmin = true;
      }
    }
  } catch (e) {
    console.error("Failed to check admin status", e);
  }

  // Allow access to maintenance page itself to avoid loops (handled by middleware usually but good to be safe)
  // But inside layout we are rendering children. 
  // If maintenance mode is ON and user is NOT admin:
  if (isMaintenanceMode && !isAdmin) {
    // We can render the maintenance page directly here instead of children, 
    // but we must ensure we don't break the html structure.
    // However, redirecting from layout is cleaner for strict enforcement.
    // We need to allow the /maintenance route specifically, but we are in RootLayout.
    // The best way is to check the header or let middleware handle it, 
    // BUT middleware cannot easily read our DB.
    // So we will render Maintenance component if condition met, 
    // UNLESS we are already on the maintenance page? 
    // In App Router, we don't easily know the current route in RootLayout without headers.
    // A safer bet: Render MaintenancePage content if mode is on.

    // Note: This replaces ALL children with Maintenance Page.
    // We need to verify we aren't already viewing it? 
    // Actually, if we just render it here, the URL stays the same, which is fine.

    /* 
       EXCEPTION: We must allow /admin login or some way to get in. 
       But regular users are blocked. Admins are allowed (isAdmin=true).
    */
    const MaintenancePage = (await import("@/app/maintenance/page")).default;

    return (
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              geistSans.variable,
              geistMono.variable,
              outfit.variable
            )}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <MaintenancePage />
              <NotificationToast />
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            geistSans.variable,
            geistMono.variable,
            outfit.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <NotificationToast />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
