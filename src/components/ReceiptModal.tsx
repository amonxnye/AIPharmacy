"use client";

import { X, Printer, Download } from "lucide-react";
import type { Sale } from "@/types/sale";
import { formatCurrency } from "@/lib/format";

interface ReceiptModalProps {
  sale: Sale | null;
  organizationName?: string;
  outletName?: string;
  currency: string;
  onClose: () => void;
}

export default function ReceiptModal({
  sale,
  organizationName = "AI Pharmacy",
  outletName = "Main Branch",
  currency,
  onClose,
}: ReceiptModalProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = generateReceiptText(
      sale,
      organizationName,
      outletName,
      currency
    );
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(receiptText)
    );
    element.setAttribute("download", `Receipt-${sale.receiptNumber}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Receipt</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="mb-6 space-y-4 border-b border-gray-200 pb-6 font-mono text-sm">
          {/* Organization */}
          <div className="text-center">
            <h3 className="font-bold text-gray-900">{organizationName}</h3>
            <p className="text-gray-600">{outletName}</p>
          </div>

          <hr className="border-gray-300" />

          {/* Receipt Number & Date */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500">Receipt #</p>
              <p className="font-bold text-gray-900">{sale.receiptNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-bold text-gray-900">
                {new Date(sale.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="text-xs">
            <p className="text-gray-500">Time</p>
            <p className="font-bold text-gray-900">
              {new Date(sale.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Cashier */}
          <div className="text-xs">
            <p className="text-gray-500">Cashier</p>
            <p className="font-bold text-gray-900">{sale.cashierName}</p>
          </div>

          <hr className="border-gray-300" />

          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-gray-500">
                      {item.quantity} × {formatCurrency(item.unitPrice, currency)}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-semibold text-gray-900">
                    {formatCurrency(item.lineTotal, currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-gray-300" />

          {/* Totals */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(sale.subtotal, currency)}
              </span>
            </div>
            {sale.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(sale.tax, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-300 pt-2">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-teal-600">
                {formatCurrency(sale.total, currency)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="text-xs">
            <p className="text-gray-500">Payment</p>
            <p className="font-bold text-gray-900 capitalize">
              {sale.paymentMethod?.replace("_", " ")}
            </p>
          </div>

          <hr className="border-gray-300" />

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>Thank you for your purchase!</p>
            <p className="mt-1">Please keep this receipt for your records.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function generateReceiptText(
  sale: Sale,
  organizationName: string,
  outletName: string,
  currency: string
): string {
  const date = new Date(sale.createdAt);
  const lines: string[] = [];

  lines.push("=".repeat(40));
  lines.push(organizationName.padStart(40));
  lines.push(outletName.padStart(40));
  lines.push("=".repeat(40));
  lines.push("");
  lines.push(`Receipt #: ${sale.receiptNumber}`);
  lines.push(`Date: ${date.toLocaleDateString()}`);
  lines.push(`Time: ${date.toLocaleTimeString()}`);
  lines.push(`Cashier: ${sale.cashierName}`);
  lines.push("");
  lines.push("-".repeat(40));
  lines.push("");

  for (const item of sale.items) {
    lines.push(`${item.productName}`);
    lines.push(
      `  ${item.quantity} x ${formatCurrency(item.unitPrice, currency)} = ${formatCurrency(item.lineTotal, currency)}`
    );
  }

  lines.push("");
  lines.push("-".repeat(40));
  lines.push(`Subtotal: ${formatCurrency(sale.subtotal, currency)}`);
  if (sale.tax > 0) {
    lines.push(`Tax:      ${formatCurrency(sale.tax, currency)}`);
  }
  lines.push(`TOTAL:    ${formatCurrency(sale.total, currency)}`);
  lines.push("");
  lines.push(`Payment: ${sale.paymentMethod?.replace("_", " ")}`);
  lines.push("");
  lines.push("=".repeat(40));
  lines.push("Thank you for your purchase!".padStart(40));
  lines.push("Please keep this receipt for your records.".padStart(40));
  lines.push("=".repeat(40));

  return lines.join("\n");
}
