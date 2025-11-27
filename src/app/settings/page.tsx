"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Save,
  Mail,
  Phone,
  MapPin,
  Percent,
  DollarSign,
} from "lucide-react";

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState("organization");
  const [saving, setSaving] = useState(false);

  // Organization settings
  const [orgSettings, setOrgSettings] = useState({
    name: "",
    logo: "",
    currency: "UGX",
    taxRate: 0,
    address: "",
    phone: "",
    email: "",
  });

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    lowStock: true,
    expiringProducts: true,
    newOrders: true,
    dailyReport: false,
    weeklyReport: true,
    monthlyReport: true,
  });

  useEffect(() => {
    if (organization) {
      setOrgSettings({
        name: organization.name || "",
        logo: organization.logo || "",
        currency: organization.currency || "UGX",
        taxRate: organization.taxRate || 0,
        address: "",
        phone: "",
        email: "",
      });
    }
  }, [organization]);

  useEffect(() => {
    if (userProfile) {
      setProfileSettings({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const tabs = [
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your organization and account settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        {/* Organization Settings */}
        {activeTab === "organization" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Organization Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your organization details and preferences
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={orgSettings.name}
                    onChange={(e) =>
                      setOrgSettings({ ...orgSettings, name: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={orgSettings.email}
                    onChange={(e) =>
                      setOrgSettings({ ...orgSettings, email: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={orgSettings.phone}
                    onChange={(e) =>
                      setOrgSettings({ ...orgSettings, phone: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <select
                    value={orgSettings.currency}
                    onChange={(e) =>
                      setOrgSettings({
                        ...orgSettings,
                        currency: e.target.value,
                      })
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="UGX">UGX - Ugandan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Percent className="h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={orgSettings.taxRate}
                    onChange={(e) =>
                      setOrgSettings({
                        ...orgSettings,
                        taxRate: parseFloat(e.target.value),
                      })
                    }
                    step="0.01"
                    min="0"
                    max="100"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-2" />
                  <textarea
                    value={orgSettings.address}
                    onChange={(e) =>
                      setOrgSettings({
                        ...orgSettings,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal details
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileSettings.name}
                  onChange={(e) =>
                    setProfileSettings({
                      ...profileSettings,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={profileSettings.email}
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileSettings.phone}
                  onChange={(e) =>
                    setProfileSettings({
                      ...profileSettings,
                      phone: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  value={userProfile?.role || ""}
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 capitalize"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Contact your administrator to change your role
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage how you receive notifications
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">Low Stock Alerts</h3>
                  <p className="text-sm text-gray-500">
                    Get notified when products are running low
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.lowStock}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      lowStock: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Expiring Products
                  </h3>
                  <p className="text-sm text-gray-500">
                    Get notified about products nearing expiry
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.expiringProducts}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      expiringProducts: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">New Orders</h3>
                  <p className="text-sm text-gray-500">
                    Get notified about new orders
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newOrders}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      newOrders: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">Daily Reports</h3>
                  <p className="text-sm text-gray-500">
                    Receive daily sales and inventory reports
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailyReport}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      dailyReport: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">Weekly Reports</h3>
                  <p className="text-sm text-gray-500">
                    Receive weekly sales and inventory reports
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      weeklyReport: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">Monthly Reports</h3>
                  <p className="text-sm text-gray-500">
                    Receive monthly sales and inventory reports
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.monthlyReport}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      monthlyReport: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Security Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your password and security preferences
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your password to keep your account secure
                </p>
                <button className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                  Change Password
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
                <button className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Enable 2FA
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900">Active Sessions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your active sessions across devices
                </p>
                <button className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  View Sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Billing & Subscription
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your subscription and payment methods
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Current Plan</h3>
                    <p className="mt-1 text-sm text-gray-500">Free Plan</p>
                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
                    Active
                  </span>
                </div>
                <button className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                  Upgrade Plan
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900">Payment Method</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No payment method added
                </p>
                <button className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Add Payment Method
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900">Billing History</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View your past invoices and payments
                </p>
                <button className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  View History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {(activeTab === "organization" || activeTab === "profile") && (
          <div className="flex justify-end border-t border-gray-200 pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
