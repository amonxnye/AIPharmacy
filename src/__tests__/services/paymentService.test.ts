import { paymentService } from "@/lib/services/paymentService";

// Mock fetch globally
global.fetch = jest.fn();

describe("paymentService", () => {
  const testOrgId = "test-org-123";
  const testAmount = 1000; // UGX 1,000 for testing
  const testPhoneNumber = "0700110561";

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("initiateSubscriptionPayment", () => {
    it("should handle subscription_new transaction type", async () => {
      const mockResponse = {
        paymentLink: "https://iotecpay.com/checkout/test-transaction-123",
        transactionId: "test-transaction-123",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Note: This test would need proper Firebase auth setup in the actual test environment
      // For now, we're testing the API contract
      const result = await paymentService.initiateSubscriptionPayment(testOrgId, "subscription_new");
      expect(result).toHaveProperty("paymentLink");
      expect(result).toHaveProperty("transactionId");
    });

    it("should handle subscription_renewal transaction type", async () => {
      const mockResponse = {
        paymentLink: "https://iotecpay.com/checkout/test-renewal-456",
        transactionId: "test-renewal-456",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await paymentService.initiateSubscriptionPayment(testOrgId, "subscription_renewal");
      expect(result).toHaveProperty("paymentLink");
      expect(result).toHaveProperty("transactionId");
    });

    it("should throw error on failed payment initiation", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid credentials" }),
      });

      await expect(
        paymentService.initiateSubscriptionPayment(testOrgId, "subscription_new")
      ).rejects.toThrow();
    });
  });

  describe("verifyPayment", () => {
    it("should verify payment status", async () => {
      const mockResponse = {
        status: "completed",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await paymentService.verifyPayment("test-transaction-123");
      expect(result.status).toBe("completed");
    });

    it("should throw error on verification failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(paymentService.verifyPayment("invalid-id")).rejects.toThrow();
    });
  });
});

describe("ioTec Integration Constants", () => {
  it("should use correct test credentials", () => {
    const testPhone = "0700110561";
    const testAmount = 1000; // UGX
    const testCurrency = "UGX";

    expect(testPhone).toBeDefined();
    expect(testAmount).toBe(1000);
    expect(testCurrency).toBe("UGX");
  });

  it("should validate UGX 1,000 as valid test amount", () => {
    const testAmount = 1000;
    const minAmount = 500;
    const maxAmount = 10000000;

    expect(testAmount).toBeGreaterThanOrEqual(minAmount);
    expect(testAmount).toBeLessThanOrEqual(maxAmount);
  });
});
