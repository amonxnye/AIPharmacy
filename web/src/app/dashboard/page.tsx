"use client";

import { 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertCircle,
} from "lucide-react";

const stats = [
  {
    name: "Total Sales Today",
    value: "UGX 2,450,000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    name: "Products in Stock",
    value: "1,234",
    change: "-3 low stock",
    trend: "warning",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    name: "Transactions",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "bg-purple-500",
  },
  {
    name: "Expiring Soon",
    value: "23",
    change: "Next 30 days",
    trend: "warning",
    icon: AlertCircle,
    color: "bg-orange-500",
  },
];

const recentSales = [
  { id: "INV-001", customer: "John Doe", amount: "UGX 45,000", time: "2 mins ago" },
  { id: "INV-002", customer: "Jane Smith", amount: "UGX 120,000", time: "15 mins ago" },
  { id: "INV-003", customer: "Bob Johnson", amount: "UGX 32,500", time: "1 hour ago" },
  { id: "INV-004", customer: "Alice Brown", amount: "UGX 78,000", time: "2 hours ago" },
];

const lowStock = [
  { name: "Paracetamol 500mg", quantity: 45, reorder: 200 },
  { name: "Amoxicillin 250mg", quantity: 32, reorder: 150 },
  { name: "Ibuprofen 400mg", quantity: 28, reorder: 100 },
  { name: "Metformin 500mg", quantity: 15, reorder: 120 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.trend === "up"
                    ? "text-green-600"
                    : stat.trend === "warning"
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
            <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{sale.customer}</p>
                  <p className="text-sm text-gray-500">{sale.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{sale.amount}</p>
                  <p className="text-xs text-gray-500">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-4">
            {lowStock.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Reorder level: {item.reorder}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                    {item.quantity} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
