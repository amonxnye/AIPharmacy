import AppShell from "@/components/layout/AppShell";

export default function ProcurementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell allowedRoles={["owner", "manager", "inventory_officer"]}>{children}</AppShell>;
}
