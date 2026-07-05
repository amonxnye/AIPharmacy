"use client";

import { useState } from "react";
import { branchService, type Branch, type CreateBranchData } from "@/lib/services/branchService";
import { X, Loader2, Building2 } from "lucide-react";

interface OutletModalProps {
  orgId: string;
  outlet?: Branch | null; // edit mode when set
  onClose: () => void;
  onSaved: () => void;
}

export default function OutletModal({ orgId, outlet, onClose, onSaved }: OutletModalProps) {
  const isEdit = !!outlet;
  const [form, setForm] = useState<CreateBranchData>({
    name: outlet?.name || "",
    address: outlet?.address || "",
    phone: outlet?.phone || "",
    license: outlet?.license || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof CreateBranchData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Outlet name is required.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && outlet) {
        await branchService.update(orgId, outlet.id, form);
      } else {
        await branchService.create(orgId, form);
      }
      onSaved();
    } catch {
      setError("Could not save the outlet. Check your access and try again.");
      setSaving(false);
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <Building2 className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Outlet" : "Add Outlet"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="outlet-name" className="mb-1 block text-sm font-medium text-gray-700">Outlet Name *</label>
            <input id="outlet-name" className={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Downtown Branch" />
          </div>
          <div>
            <label htmlFor="outlet-address" className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <input id="outlet-address" className={input} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="outlet-phone" className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input id="outlet-phone" className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label htmlFor="outlet-license" className="mb-1 block text-sm font-medium text-gray-700">License Number</label>
              <input id="outlet-license" className={input} value={form.license} onChange={(e) => set("license", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : isEdit ? "Save Changes" : "Add Outlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
