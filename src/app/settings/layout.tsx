import AppShell from "@/components/layout/AppShell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell allowedRoles={["owner", "manager"]}>{children}</AppShell>;
}
