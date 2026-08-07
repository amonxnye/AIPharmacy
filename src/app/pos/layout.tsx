import AppShell from "@/components/layout/AppShell";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell allowedRoles={["owner", "manager", "pharmacist", "cashier"]}>
      {children}
    </AppShell>
  );
}
