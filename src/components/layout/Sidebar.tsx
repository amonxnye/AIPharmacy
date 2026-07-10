"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_ROLES } from "@/components/RoleGuard";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Procurement", href: "/procurement", icon: Truck },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  { name: "Outlets", href: "/outlets", icon: Building2 },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
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

  const displayName = globalProfile?.displayName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleLabel = ROLE_LABELS[currentMembership?.role || ""] || "Member";

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-teal-600 to-teal-800 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-teal-500/30">
        <Link href="/dashboard" className="text-2xl font-bold hover:text-teal-100 transition-colors">
          AI-Pharmacy
        </Link>
      </div>

      {/* Navigation — filtered by role */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-white/10",
                  isActive && "bg-white/20 shadow-lg"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* Help & Feedback */}
      <div className="px-3 pb-2 space-y-1">
        <a
          href="mailto:support@aipharmacy.com"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-teal-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </a>
        <a
          href="mailto:feedback@aipharmacy.com?subject=AIPharmacy Feedback"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-teal-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <MessageSquare className="h-4 w-4" />
          Send Feedback
        </a>
      </div>

      {/* User Section */}
      <div className="border-t border-teal-500/30 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-teal-200">{roleLabel}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="hover:text-teal-200 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
