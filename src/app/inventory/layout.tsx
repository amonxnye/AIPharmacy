import AppShell from "@/components/layout/AppShell";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell allowedRoles={["owner", "manager", "pharmacist", "cashier", "inventory_officer"]}>
      {children}
    </AppShell>
  );
}
