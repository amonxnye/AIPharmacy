import ProtectedRoute from "@/components/ProtectedRoute";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
