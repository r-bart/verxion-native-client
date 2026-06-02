import Constants from "expo-constants";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const scheme = (Constants.expoConfig?.scheme as string) ?? "verxion";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type GetCookie = () => string;
type UnauthorizedHandler = () => void;

class ApiClient {
  private getCookieFn: GetCookie | null = null;
  private onUnauthorized: UnauthorizedHandler | null = null;

  setGetCookie(fn: GetCookie) {
    this.getCookieFn = fn;
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    this.onUnauthorized = handler;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Origin: `${scheme}://`,
    };

    if (this.getCookieFn) {
      try {
        const cookie = this.getCookieFn();
        if (cookie) headers["Cookie"] = cookie;
      } catch {
        // Auth not ready
      }
    }

    if (["POST", "PUT", "PATCH"].includes(method)) {
      headers["Idempotency-Key"] = generateUUID();
    }

    const response = await fetch(`${API_URL}/api/v1${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }
      const body = await response.json().catch(() => ({}));
      throw new ApiError(
        body.message || response.statusText,
        response.status,
        body.code
      );
    }

    if (response.status === 204) return undefined as T;

    const json = await response.json();

    if (json !== null && typeof json === "object" && "data" in json) {
      return json.data as T;
    }
    return json as T;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`${path}${query}`);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const apiClient = new ApiClient();
