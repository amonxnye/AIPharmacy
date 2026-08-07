"use client";

import { useState, useEffect } from "react";
import { subscriptionService } from "@/lib/services/subscriptionService";
import { formatCurrency } from "@/lib/format";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

interface EarningsWidgetProps {
  organizationId: string;
  currency: string;
}

export default function EarningsWidget({ organizationId, currency }: EarningsWidgetProps) {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [allTimeEarnings, setAllTimeEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const today30DaysAgo = new Date(today);
        today30DaysAgo.setDate(today.getDate() - 30);

        const [todayVal, monthVal, allTimeVal] = await Promise.all([
          subscriptionService.getDailyEarnings(organizationId, today),
          subscriptionService.getMonthlyEarnings(organizationId, year, month),
          subscriptionService.calculateEarnings(organizationId, today30DaysAgo, new Date()),
        ]);

        setTodayEarnings(todayVal);
        setMonthEarnings(monthVal);
        setAllTimeEarnings(allTimeVal);
      } catch {
        // Silent failure
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 p-4 ring-1 ring-teal-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">Today&apos;s Earnings</p>
            <p className="mt-2 text-2xl font-bold text-teal-900">
              {formatCurrency(todayEarnings, currency)}
            </p>
          </div>
          <DollarSign className="h-10 w-10 text-teal-600" />
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 ring-1 ring-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">This Month</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {formatCurrency(monthEarnings, currency)}
            </p>
          </div>
          <Calendar className="h-10 w-10 text-blue-600" />
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 ring-1 ring-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-700">Last 30 Days</p>
            <p className="mt-2 text-2xl font-bold text-purple-900">
              {formatCurrency(allTimeEarnings, currency)}
            </p>
          </div>
          <TrendingUp className="h-10 w-10 text-purple-600" />
        </div>
      </div>
    </div>
  );
}
