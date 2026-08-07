import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import type { UserRole } from "@/types/user";

// Shared authenticated application shell: auth + organization guard, sidebar,
// header, and optional page-level role enforcement.
export default function AppShell({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const content = allowedRoles ? (
    <RoleGuard allowedRoles={allowedRoles}>{children}</RoleGuard>
  ) : (
    children
  );

  return (
    <ProtectedRoute requireOrganization={true}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{content}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
