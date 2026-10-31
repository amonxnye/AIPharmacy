"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Building2,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
  Truck,
  CreditCard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_ROLES } from "@/components/RoleGuard";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "View sales and inventory overview" },
  { name: "Inventory", href: "/inventory", icon: Package, description: "Manage products and batches" },
  { name: "POS", href: "/pos", icon: ShoppingCart, description: "Process sales and transactions" },
  { name: "Procurement", href: "/procurement", icon: Truck, description: "Order and track stock" },
  { name: "Subscription", href: "/subscription", icon: CreditCard, description: "Manage your plan" },
  { name: "Outlets", href: "/outlets", icon: Building2, description: "Manage pharmacy branches" },
  { name: "Staff", href: "/staff", icon: Users, description: "Manage team members" },
  { name: "Settings", href: "/settings", icon: Settings, description: "Configure your account" },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  pharmacist: "Pharmacist",
  cashier: "Cashier",
  inventory_officer: "Inventory Officer",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { globalProfile, currentMembership, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = globalProfile?.displayName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleLabel = ROLE_LABELS[currentMembership?.role || ""] || "Member";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-teal-600 to-teal-800 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-teal-500/30">
        <Link
          href="/dashboard"
          className="text-2xl font-bold hover:text-teal-100 transition-colors duration-200"
          aria-label="Go to dashboard"
        >
          AI-Pharmacy
        </Link>
      </div>

      {/* Navigation — filtered by role */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation
          .filter((item) => {
            const allowed = PAGE_ROLES[item.href];
            if (!allowed) return true;
            return currentMembership?.role && allowed.includes(currentMembership.role);
          })
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={item.description}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30",
                  isActive && "bg-white/20 shadow-lg"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* Help & Feedback */}
      <div className="px-3 pb-2 space-y-1 border-t border-teal-500/30">
        <a
          href="mailto:support@aipharmacy.com"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-teal-200 hover:bg-white/10 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          title="Contact support"
        >
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          Help & Support
        </a>
        <a
          href="mailto:feedback@aipharmacy.com?subject=AIPharmacy Feedback"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-teal-200 hover:bg-white/10 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          title="Send feedback"
        >
          <MessageSquare className="h-4 w-4 flex-shrink-0" />
          Send Feedback
        </a>
      </div>

      {/* User Section */}
      <div className="border-t border-teal-500/30 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-teal-200">{roleLabel}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-teal-200 hover:text-white hover:bg-white/10 rounded p-1.5 transition-colors duration-200 disabled:opacity-50 cursor-disabled focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Sign out"
            aria-label="Sign out"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
