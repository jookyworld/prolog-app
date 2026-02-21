import * as SecureStore from "expo-secure-store";
import { API_URL } from "./constants";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const TOKEN_KEY = "prolog_access_token";
const REFRESH_TOKEN_KEY = "prolog_refresh_token";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function hasTokens(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token !== null;
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new ApiError(401, "토큰 갱신에 실패했습니다.");
  }

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    throw new ApiError(401, "토큰 갱신에 실패했습니다.");
  }

  const data = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const accessToken = await getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options?.headers,
  };

  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (
    res.status === 401 &&
    !path.includes("/auth/refresh") &&
    !path.includes("/auth/login")
  ) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;

      const newAccessToken = await getAccessToken();
      const retryHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(newAccessToken
          ? { Authorization: `Bearer ${newAccessToken}` }
          : {}),
        ...options?.headers,
      };

      const retryRes = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: retryHeaders,
      });

      if (!retryRes.ok) {
        throw new ApiError(
          retryRes.status,
          `API 요청 실패 (${retryRes.status})`,
        );
      }

      if (retryRes.status === 204) return undefined as T;
      return retryRes.json();
    } catch {
      throw new ApiError(401, "인증이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, `API 요청 실패 (${res.status})`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
