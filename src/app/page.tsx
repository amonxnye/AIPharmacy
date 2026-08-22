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
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// Animated background gradient effect
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl animate-pulse delay-75" />
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/10 blur-3xl" />
    </div>
  );
}

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
        <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-white" />
        <AnimatedBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200 border border-teal-100 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Trusted by pharmacies in 50+ countries
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              The pharmacy management platform built for{" "}
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">global scale</span>
            </h1>
            <p className="mt-8 text-lg leading-8 text-gray-600 sm:text-xl max-w-2xl mx-auto">
              Manage inventory, process sales, track expiries, and run multiple
              outlets — all from one cloud platform. From a single pharmacy to a
              nationwide chain, AIPharmacy grows with you.
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-600/30 hover:shadow-2xl hover:shadow-teal-600/40 transition-all duration-300 transform hover:scale-105"
              >
                Start Free — No Credit Card
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-gray-700 hover:border-teal-300 hover:bg-white hover:text-teal-600 transition-all duration-300 hover:shadow-lg"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-y border-gray-200/50 bg-gradient-to-b from-white via-teal-50/30 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {TRUST_STATS.map((stat, idx) => (
              <div key={stat.label} className="group relative text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100/0 to-cyan-100/0 group-hover:from-teal-100/50 group-hover:to-cyan-100/50 rounded-2xl transition-all duration-300 blur" />
                <div className="relative rounded-2xl border border-teal-100/50 group-hover:border-teal-200 bg-white/50 backdrop-blur-sm p-6 transition-all duration-300 group-hover:shadow-lg">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="mt-2 text-sm font-medium text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Everything your pharmacy needs, nothing it doesn&apos;t
            </h2>
            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
              Purpose-built for pharmacies — not adapted from generic retail
              software. Every feature understands batches, expiry dates,
              prescriptions, and regulatory compliance.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100/0 via-cyan-100/0 to-teal-100/0 group-hover:from-teal-100/50 group-hover:via-cyan-100/30 group-hover:to-teal-100/50 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                <div className="relative rounded-2xl border border-teal-100/50 group-hover:border-teal-200/80 bg-white/60 backdrop-blur-sm p-8 shadow-sm group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-600 group-hover:shadow-lg transition-all">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600 group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AIPharmacy */}
      <section className="bg-gradient-to-b from-white via-teal-50/40 to-white py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />
          <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Why pharmacies choose AIPharmacy
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Built for Any Market",
                desc: "Multi-currency, configurable tax rules (VAT, GST, Sales Tax), and localized compliance. Works in Uganda, India, Nigeria, the UK, or anywhere in between."
              },
              {
                icon: Clock,
                title: "Live in Under 5 Minutes",
                desc: "Create your account, set up your first outlet, and start adding products. No installations, no consultants, no IT department required."
              },
              {
                icon: ShieldCheck,
                title: "Enterprise-Grade Security",
                desc: "Complete data isolation between organizations. Role-based access control, encrypted data at rest, and audit logging for regulatory compliance."
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-100/0 to-cyan-100/0 group-hover:from-teal-100/40 group-hover:to-cyan-100/40 rounded-2xl blur-lg transition-all duration-500" />
                  <div className="relative rounded-2xl border border-teal-100/60 group-hover:border-teal-200 bg-white/70 backdrop-blur-sm p-8 text-center transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-600 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600 group-hover:text-gray-700">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-white to-teal-50/30">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
              Start free. Upgrade when you need more outlets, more staff, or AI
              features. No hidden fees, no long-term contracts.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`group relative rounded-2xl transition-all duration-300 ${
                  plan.highlighted
                    ? "lg:scale-105"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-100/60 to-cyan-100/60 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                )}
                <div
                  className={`relative rounded-2xl border-2 p-8 backdrop-blur-sm transition-all duration-300 ${
                    plan.highlighted
                      ? "border-teal-500 bg-gradient-to-br from-white to-teal-50/40 shadow-2xl"
                      : "border-teal-100/50 bg-white/70 group-hover:border-teal-200 group-hover:shadow-lg group-hover:bg-white"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className={`text-5xl font-bold ${plan.highlighted ? "text-teal-600" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-gray-500">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{plan.description}</p>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-gray-700"
                      >
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className={`mt-10 block w-full rounded-xl px-6 py-3 text-center text-sm font-bold transition-all duration-300 transform ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/40 hover:shadow-xl hover:shadow-teal-600/50 hover:scale-105"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200 group-hover:bg-teal-50 group-hover:text-teal-600"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gradient-to-b from-white via-teal-50/20 to-white py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Trusted by pharmacy professionals worldwide
            </h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 to-teal-100/0 group-hover:from-amber-100/40 group-hover:to-teal-100/40 rounded-2xl blur-lg transition-all duration-500 opacity-0 group-hover:opacity-100" />
                <div className="relative rounded-2xl border border-teal-100/50 group-hover:border-teal-200 bg-white/60 backdrop-blur-sm p-8 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-5 text-base leading-7 text-gray-700 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-teal-100/50 pt-5">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {t.author}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t.role} <span className="text-gray-400">·</span> {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 h-80 w-80 rounded-full bg-white/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl animate-pulse delay-75" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Ready to modernize your pharmacy?
          </h2>
          <p className="mt-6 text-lg text-teal-100 max-w-2xl mx-auto">
            Join thousands of pharmacies using AIPharmacy to reduce waste, speed
            up sales, and grow with confidence. Set up in under 5 minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-teal-600 hover:bg-teal-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Create Free Account
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="mailto:sales@aipharmacy.com"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <HeadphonesIcon className="h-5 w-5" />
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-100/50 bg-gradient-to-b from-white to-teal-50/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 text-white font-bold text-sm shadow-lg">
                  Ai
                </div>
                <span className="text-xl font-bold text-gray-900">AIPharmacy</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cloud-based pharmacy management for the modern world.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="mailto:support@aipharmacy.com" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Contact Support</a></li>
                <li><a href="mailto:sales@aipharmacy.com" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Sales Inquiries</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-teal-100/50 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} AIPharmacy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
