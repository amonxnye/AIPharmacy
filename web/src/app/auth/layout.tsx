export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {children}
    </div>
  );
}
