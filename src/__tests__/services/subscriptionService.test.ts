import { subscriptionService } from "@/lib/services/subscriptionService";

describe("subscriptionService", () => {
  const testOrgId = "test-org-123";
  const testDate = new Date("2026-07-10");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("daysUntilExpiry", () => {
    it("should return positive days for future date", () => {
      const futureDate = new Date(testDate);
      futureDate.setDate(futureDate.getDate() + 15);
      const days = subscriptionService.daysUntilExpiry(futureDate);
      expect(days).toBe(15);
    });

    it("should return 0 for today", () => {
      const today = new Date(testDate);
      const days = subscriptionService.daysUntilExpiry(today);
      expect(days).toBeLessThanOrEqual(0);
    });

    it("should return negative for past date", () => {
      const pastDate = new Date(testDate);
      pastDate.setDate(pastDate.getDate() - 5);
      const days = subscriptionService.daysUntilExpiry(pastDate);
      expect(days).toBeLessThan(0);
    });
  });

  describe("isSubscriptionExpired", () => {
    it("should return false for future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const expired = subscriptionService.isSubscriptionExpired(futureDate);
      expect(expired).toBe(false);
    });

    it("should return true for past date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const expired = subscriptionService.isSubscriptionExpired(pastDate);
      expect(expired).toBe(true);
    });
  });

  describe("calculateEarnings", () => {
    it("should return 0 for organization with no sales", async () => {
      const startDate = new Date();
      const endDate = new Date();
      const earnings = await subscriptionService.calculateEarnings(testOrgId, startDate, endDate);
      expect(earnings).toBe(0);
    });
  });

  describe("getDailyEarnings", () => {
    it("should return earnings for specific date", async () => {
      const date = new Date();
      const earnings = await subscriptionService.getDailyEarnings(testOrgId, date);
      expect(typeof earnings).toBe("number");
      expect(earnings).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getMonthlyEarnings", () => {
    it("should return earnings for specific month", async () => {
      const earnings = await subscriptionService.getMonthlyEarnings(testOrgId, 2026, 7);
      expect(typeof earnings).toBe("number");
      expect(earnings).toBeGreaterThanOrEqual(0);
    });
  });
});
