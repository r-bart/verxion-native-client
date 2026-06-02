/**
 * Tests for the ApiClient class.
 *
 * We need to test a singleton instance, so we re-import the module
 * fresh for each test to get a clean ApiClient.
 */

// Mock expo-constants before importing apiClient
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: { scheme: "verxion" },
  },
}));

// Store original env
const originalEnv = process.env.EXPO_PUBLIC_API_URL;

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_URL = "https://api.test.com";
  jest.resetModules();
  (global.fetch as jest.Mock) = jest.fn();
});

afterEach(() => {
  if (originalEnv !== undefined) {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
  } else {
    delete process.env.EXPO_PUBLIC_API_URL;
  }
  jest.restoreAllMocks();
});

function mockFetchResponse(body: unknown, status = 200, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: jest.fn().mockResolvedValue(body),
  });
}

describe("ApiClient", () => {
  it("get() constructs correct URL with /api/v1 prefix", async () => {
    mockFetchResponse({ data: { id: 1 } });
    const { apiClient } = require("../apiClient");

    await apiClient.get("/analytics/streaks");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test.com/api/v1/analytics/streaks",
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("get() appends query params", async () => {
    mockFetchResponse({ data: [] });
    const { apiClient } = require("../apiClient");

    await apiClient.get("/sessions", { status: "in_progress", limit: "1" });

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("status=in_progress");
    expect(url).toContain("limit=1");
  });

  it("post() sends JSON body with Idempotency-Key header", async () => {
    mockFetchResponse({ data: { id: "wl-1" } });
    const { apiClient } = require("../apiClient");

    await apiClient.post("/measurements/weight", { weightKg: 80 });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ weightKg: 80 }));
    expect(options.headers["Idempotency-Key"]).toBeDefined();
    expect(options.headers["Idempotency-Key"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("unwraps { data: T } envelope", async () => {
    mockFetchResponse({ data: { streaks: 5 } });
    const { apiClient } = require("../apiClient");

    const result = await apiClient.get("/analytics/streaks");
    expect(result).toEqual({ streaks: 5 });
  });

  it("returns raw response when no data envelope", async () => {
    mockFetchResponse({ streaks: 5 });
    const { apiClient } = require("../apiClient");

    const result = await apiClient.get("/analytics/streaks");
    expect(result).toEqual({ streaks: 5 });
  });

  it("returns undefined for 204 responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
      statusText: "No Content",
      json: jest.fn(),
    });
    const { apiClient } = require("../apiClient");

    const result = await apiClient.get("/some-endpoint");
    expect(result).toBeUndefined();
  });

  it("throws ApiError on non-ok responses", async () => {
    mockFetchResponse({ message: "Not found", code: "NOT_FOUND" }, 404, false);
    const { apiClient, ApiError } = require("../apiClient");

    await expect(apiClient.get("/nonexistent")).rejects.toThrow(ApiError);

    try {
      await apiClient.get("/nonexistent");
    } catch (error: unknown) {
      const apiError = error as InstanceType<typeof ApiError>;
      expect(apiError.status).toBe(404);
      expect(apiError.code).toBe("NOT_FOUND");
      expect(apiError.message).toBe("Not found");
    }
  });

  it("sets Origin header for CSRF", async () => {
    mockFetchResponse({ data: {} });
    const { apiClient } = require("../apiClient");

    await apiClient.get("/test");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers["Origin"]).toBe("verxion://");
  });

  it("injects cookie when getCookieFn is set", async () => {
    mockFetchResponse({ data: {} });
    const { apiClient } = require("../apiClient");

    apiClient.setGetCookie(() => "session=abc123");
    await apiClient.get("/users/me");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers["Cookie"]).toBe("session=abc123");
  });

  it("does not set Cookie header when getCookieFn returns empty", async () => {
    mockFetchResponse({ data: {} });
    const { apiClient } = require("../apiClient");

    apiClient.setGetCookie(() => "");
    await apiClient.get("/users/me");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers["Cookie"]).toBeUndefined();
  });

  it("handles getCookieFn throwing gracefully", async () => {
    mockFetchResponse({ data: {} });
    const { apiClient } = require("../apiClient");

    apiClient.setGetCookie(() => {
      throw new Error("SecureStore not ready");
    });

    // Should not throw
    const result = await apiClient.get("/test");
    expect(result).toEqual({});
  });

  it("calls onUnauthorized on 401", async () => {
    mockFetchResponse({ message: "Unauthorized" }, 401, false);
    const { apiClient } = require("../apiClient");

    const handler = jest.fn();
    apiClient.setUnauthorizedHandler(handler);

    await expect(apiClient.get("/protected")).rejects.toThrow();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call onUnauthorized on non-401 errors", async () => {
    mockFetchResponse({ message: "Server Error" }, 500, false);
    const { apiClient } = require("../apiClient");

    const handler = jest.fn();
    apiClient.setUnauthorizedHandler(handler);

    await expect(apiClient.get("/broken")).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });

  it("handles JSON parse failure on error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    });
    const { apiClient, ApiError } = require("../apiClient");

    try {
      await apiClient.get("/broken");
    } catch (error: unknown) {
      const apiError = error as InstanceType<typeof ApiError>;
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe("Internal Server Error");
    }
  });
});
