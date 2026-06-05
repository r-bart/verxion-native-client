import Constants from "expo-constants";
import { ApiError } from "@/domain/_shared/errors";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const scheme = (Constants.expoConfig?.scheme as string) ?? "verxion";

// Re-exported so the existing infrastructure imports (`from "../api/apiClient"`)
// keep working; the class itself now lives in the shared kernel so presentation
// can inspect it without crossing the infrastructure boundary.
export { ApiError };

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
    const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;

    const headers: Record<string, string> = {
      Origin: `${scheme}://`,
    };
    // Let fetch set the multipart boundary itself for FormData bodies.
    if (!isForm) headers["Content-Type"] = "application/json";

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

  // Multipart upload (e.g. avatar). Pass a FormData; `request` detects it and
  // omits the JSON Content-Type so fetch can set the boundary.
  async postForm<T>(path: string, form: FormData): Promise<T> {
    return this.request<T>(path, { method: "POST", body: form });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // `del` (not `delete`) — `delete` is a reserved word. Maps to HTTP DELETE;
  // `request` returns `undefined` for the common 204 No Content response.
  async del<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
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
