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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-lg font-semibold text-gray-900">AIPharmacy</span>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900">Testimonials</a>
            <Link href="/auth/login" className="text-sm font-medium text-gray-900 hover:text-teal-700">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Get Started Free
            </Link>
          </div>

          <button
            className="p-2 text-gray-600 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <Link href="/auth/login" className="text-sm font-medium text-gray-900">Sign In</Link>
              <Link href="/auth/register" className="rounded-lg bg-teal-600 px-4 py-2 text-center text-sm font-medium text-white">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-teal-700">
              Trusted by pharmacies in 50+ countries
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
              The pharmacy management platform built for global scale
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Manage inventory, process sales, track expiries, and run multiple
              outlets — all from one cloud platform. From a single pharmacy to a
              nationwide chain, AIPharmacy grows with you.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700"
              >
                Start Free — No Credit Card
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-y border-gray-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-gray-600">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              Everything your pharmacy needs, nothing it doesn&apos;t
            </h2>
            <p className="mt-4 text-base text-gray-600">
              Purpose-built for pharmacies — not adapted from generic retail
              software. Every feature understands batches, expiry dates,
              prescriptions, and regulatory compliance.
            </p>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="border-t border-gray-200 pt-6">
                <feature.icon className="h-5 w-5 text-teal-700" />
                <h3 className="mt-4 text-base font-semibold text-gray-900">
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
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900">
            Why pharmacies choose AIPharmacy
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
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
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-gray-200 bg-white p-6">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-base text-gray-600">
              Start free. Upgrade when you need more outlets, more staff, or AI
              features. No hidden fees, no long-term contracts.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-lg border bg-white p-8 ${
                  plan.highlighted ? "border-teal-600" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="text-xs font-medium text-teal-700">Most Popular</span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-gray-900 tabular-nums">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`mt-8 block w-full rounded-lg px-6 py-3 text-center text-sm font-medium ${
                    plan.highlighted
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "border border-gray-300 text-gray-900 hover:bg-gray-50"
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
      <section id="testimonials" className="border-t border-gray-200 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900">
            Trusted by pharmacy professionals worldwide
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.author} className="border-l-2 border-gray-200 pl-6">
                <blockquote className="text-base leading-7 text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4">
                  <div className="text-sm font-semibold text-gray-900">{t.author}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {t.role} · {t.location}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold text-white">
            Ready to modernize your pharmacy?
          </h2>
          <p className="mt-4 max-w-2xl text-base text-gray-300">
            Join thousands of pharmacies using AIPharmacy to reduce waste, speed
            up sales, and grow with confidence. Set up in under 5 minutes.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700"
            >
              Create Free Account
              <ChevronRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:sales@aipharmacy.com"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              <HeadphonesIcon className="h-4 w-4" />
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <span className="text-base font-semibold text-gray-900">AIPharmacy</span>
              <p className="mt-2 text-sm text-gray-500">
                Cloud-based pharmacy management for the modern world.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Product</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#features" className="text-gray-600 hover:text-gray-900">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                <li><a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Support</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="mailto:support@aipharmacy.com" className="text-gray-600 hover:text-gray-900">Contact Support</a></li>
                <li><a href="mailto:sales@aipharmacy.com" className="text-gray-600 hover:text-gray-900">Sales Inquiries</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} AIPharmacy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
