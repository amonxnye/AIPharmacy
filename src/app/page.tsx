"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  BarChart3,
  Globe,
  Zap,
  Package,
  Users,
  Store,
  Brain,
  Check,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Star,
  Clock,
  HeadphonesIcon,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Store,
    title: "Multi-Outlet Management",
    description:
      "Manage unlimited pharmacy branches from a single dashboard. Track performance, inventory, and staff across every location in real time.",
  },
  {
    icon: Package,
    title: "Smart Inventory & Batch Tracking",
    description:
      "Track every product by batch number and expiry date. Get automatic low-stock alerts and expiry warnings before they cost you money.",
  },
  {
    icon: Zap,
    title: "Fast Point of Sale",
    description:
      "Process sales in seconds with barcode scanning, smart search, and automatic tax calculation. Works on any device — desktop, tablet, or phone.",
  },
  {
    icon: Users,
    title: "Role-Based Staff Access",
    description:
      "Assign roles — Owner, Manager, Pharmacist, Cashier, Inventory Officer — each sees only what they need. Invite staff via email in one click.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Daily sales summaries, stock valuation, expiry reports, and staff performance metrics. Export to CSV or PDF for tax filing and audits.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Demand forecasting predicts what to reorder and when. Drug interaction alerts protect patients at the point of sale. Fraud detection flags anomalies.",
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "For single-outlet pharmacies getting started",
    features: [
      "1 outlet",
      "3 staff accounts",
      "Up to 500 products",
      "Basic POS & inventory",
      "Email support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For growing pharmacies with multiple locations",
    features: [
      "Up to 10 outlets",
      "25 staff accounts",
      "Unlimited products",
      "Advanced reports & analytics",
      "Receipt customization",
      "Procurement module",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For pharmacy chains and hospital networks",
    features: [
      "Unlimited outlets & staff",
      "AI demand forecasting",
      "Drug interaction alerts",
      "Fraud detection",
      "API access & integrations",
      "Dedicated account manager",
      "SLA & uptime guarantee",
      "Custom data residency",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const TRUST_STATS = [
  { value: "50+", label: "Countries Supported" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "30s", label: "Average Onboarding" },
  { value: "24/7", label: "Support Available" },
];

const TESTIMONIALS = [
  {
    quote:
      "AIPharmacy replaced three different systems we were using. Now all our outlets run on one platform and I can see everything from my phone.",
    author: "Dr. Amara Okonkwo",
    role: "Owner, LifeCare Pharmacies",
    location: "Lagos, Nigeria",
  },
  {
    quote:
      "The batch tracking and expiry alerts alone saved us thousands in expired stock. Setup took less than an hour.",
    author: "Raj Patel",
    role: "Operations Manager",
    location: "Mumbai, India",
  },
  {
    quote:
      "My cashiers were trained on the POS in 10 minutes. The role-based access means I don't worry about staff seeing sensitive data.",
    author: "Marie Dupont",
    role: "Pharmacy Director",
    location: "Dakar, Senegal",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-sm">
              Ai
            </div>
            <span className="text-xl font-bold text-gray-900">AIPharmacy</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Testimonials</a>
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <Link href="/auth/login" className="text-sm font-medium text-gray-700">Sign In</Link>
              <Link href="/auth/register" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white text-center">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200">
              <Globe className="h-4 w-4" />
              Trusted by pharmacies in 50+ countries
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              The pharmacy management platform built for{" "}
              <span className="text-teal-600">global scale</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Manage inventory, process sales, track expiries, and run multiple
              outlets — all from one cloud platform. From a single pharmacy to a
              nationwide chain, AIPharmacy grows with you.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 transition-all hover:shadow-xl hover:shadow-teal-600/30"
              >
                Start Free — No Credit Card
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:border-teal-300 hover:text-teal-600 transition-colors"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-teal-600">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything your pharmacy needs, nothing it doesn&apos;t
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Purpose-built for pharmacies — not adapted from generic retail
              software. Every feature understands batches, expiry dates,
              prescriptions, and regulatory compliance.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AIPharmacy */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why pharmacies choose AIPharmacy
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Built for Any Market
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Multi-currency, configurable tax rules (VAT, GST, Sales Tax),
                and localized compliance. Works in Uganda, India, Nigeria, the
                UK, or anywhere in between.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Live in Under 5 Minutes
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Create your account, set up your first outlet, and start adding
                products. No installations, no consultants, no IT department
                required.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Enterprise-Grade Security
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Complete data isolation between organizations. Role-based access
                control, encrypted data at rest, and audit logging for
                regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free. Upgrade when you need more outlets, more staff, or AI
              features. No hidden fees, no long-term contracts.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-teal-600 bg-white shadow-xl ring-1 ring-teal-600 relative"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "bg-gray-50 text-gray-900 hover:bg-gray-100 ring-1 ring-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by pharmacy professionals worldwide
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
              >
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {t.author}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.role} &middot; {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-600 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to modernize your pharmacy?
          </h2>
          <p className="mt-4 text-lg text-teal-100">
            Join thousands of pharmacies using AIPharmacy to reduce waste, speed
            up sales, and grow with confidence. Set up in under 5 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
            >
              Create Free Account
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="mailto:sales@aipharmacy.com"
              className="inline-flex items-center gap-2 rounded-lg border border-teal-400 px-6 py-3 text-base font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              <HeadphonesIcon className="h-5 w-5" />
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
                  Ai
                </div>
                <span className="text-lg font-bold text-gray-900">AIPharmacy</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Cloud-based pharmacy management for the modern world.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-teal-600">Features</a></li>
                <li><a href="#pricing" className="hover:text-teal-600">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-teal-600">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Support</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="mailto:support@aipharmacy.com" className="hover:text-teal-600">Contact Support</a></li>
                <li><a href="mailto:sales@aipharmacy.com" className="hover:text-teal-600">Sales Inquiries</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-teal-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-600">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AIPharmacy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
