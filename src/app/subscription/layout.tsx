import AppShell from "@/components/layout/AppShell";

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell allowedRoles={["owner", "manager"]}>{children}</AppShell>;
}
