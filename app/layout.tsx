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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  if (user) {
    await createUser({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      username: user.username || `user_${user.id.slice(0, 8)}`,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      photo: user.imageUrl,
    });
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
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
