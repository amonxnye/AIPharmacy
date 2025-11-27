"use client";

import { Plus, Search, Filter, Download } from "lucide-react";

const inventory = [
  {
    id: 1,
    name: "Paracetamol",
    brand: "Panadol",
    strength: "500mg",
    form: "Tablets",
    batch: "BT2024001",
    quantity: 450,
    expiry: "2025-12-31",
    costPrice: 50,
    sellingPrice: 100,
  },
  {
    id: 2,
    name: "Amoxicillin",
    brand: "Amoxil",
    strength: "250mg",
    form: "Capsules",
    batch: "BT2024002",
    quantity: 320,
    expiry: "2025-08-15",
    costPrice: 200,
    sellingPrice: 350,
  },
  {
    id: 3,
    name: "Ibuprofen",
    brand: "Brufen",
    strength: "400mg",
    form: "Tablets",
    batch: "BT2024003",
    quantity: 280,
    expiry: "2026-03-20",
    costPrice: 80,
    sellingPrice: 150,
  },
  {
    id: 4,
    name: "Metformin",
    brand: "Glucophage",
    strength: "500mg",
    form: "Tablets",
    batch: "BT2024004",
    quantity: 150,
    expiry: "2025-11-30",
    costPrice: 120,
    sellingPrice: 200,
  },
  {
    id: 5,
    name: "Omeprazole",
    brand: "Losec",
    strength: "20mg",
    form: "Capsules",
    batch: "BT2024005",
    quantity: 200,
    expiry: "2026-01-15",
    costPrice: 150,
    sellingPrice: 250,
  },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your pharmacy stock and products
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, brand, or batch..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {inventory.map((item) => {
                const isLowStock = item.quantity < 100;
                const expiryDate = new Date(item.expiry);
                const daysToExpiry = Math.floor(
                  (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isExpiringSoon = daysToExpiry < 90;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.brand} - {item.strength} {item.form}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {item.batch}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          isLowStock
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {item.expiry}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      UGX {item.costPrice.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      UGX {item.sellingPrice.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {isExpiringSoon ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                          Expiring Soon
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          Good
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
