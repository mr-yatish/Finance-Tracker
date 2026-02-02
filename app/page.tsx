import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Wallet, Shield, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/components/shared/ModeToggle";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src="/images/logo.png" alt="Daily Budget" className="h-12 w-auto" />
            <span className="font-[family-name:var(--font-outfit)]">Daily Budget</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Background Gradient Blob */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="container relative mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl space-y-8">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                Master Your Money. <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Own Your Future.
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                The modern way to track expenses, visualize income, and achieve your financial goals. Simple, secure, and beautiful.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="h-12 w-full px-8 text-lg sm:w-auto" asChild>
                  <Link href="/sign-up">
                    Start Tracking Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 w-full px-8 text-lg sm:w-auto" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to grow</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools to help you manage your personal finances with ease.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Visual Analytics"
              description="Understand your spending patterns with beautiful, interactive charts and graphs."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Budget Tracking"
              description="Set monthly limits and track your progress in real-time to never overspend again."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Bank-Grade Security"
              description="Your data is encrypted and secure. We prioritize your privacy above all else."
            />
            <FeatureCard
              icon={<DollarSign className="h-10 w-10 text-primary" />}
              title="Income Management"
              description="Keep track of multiple income streams and manage your cash flow effectively."
            />
            <FeatureCard
              icon={<Wallet className="h-10 w-10 text-primary" />}
              title="Multi-Currency"
              description="Support for global currencies to manage expenses wherever you are."
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-primary" />}
              title="Goal Setting"
              description="Set financial goals and track your journey to achieving them."
            />
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="border-y bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 text-center md:grid-cols-3">
              <div>
                <div className="text-4xl font-bold text-primary">100%</div>
                <div className="mt-2 text-muted-foreground">Free to Use</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">Secure</div>
                <div className="mt-2 text-muted-foreground">Data Encryption</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">24/7</div>
                <div className="mt-2 text-muted-foreground">Access Anywhere</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl bg-primary px-6 py-16 text-primary-foreground">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to take control?</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90 font-medium">
              Join thousands of users who are already managing their money smarter.
            </p>
            <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-lg" asChild>
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Daily Budget. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="mb-4 rounded-xl bg-primary/10 p-3 w-fit transition-colors group-hover:bg-primary/20">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
