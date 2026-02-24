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
    await clearTokens();
    throw new ApiError(401, "토큰 갱신에 실패했습니다.");
  }

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Send refresh token in Authorization header as fallback
      "X-Refresh-Token": refreshToken,
    },
    credentials: "include", // Include cookies if backend uses them
  });

  if (!res.ok) {
    await clearTokens();
    let errorMsg = "토큰 갱신에 실패했습니다.";
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // Ignore JSON parse error
    }
    throw new ApiError(401, errorMsg);
  }

  const data = await res.json();
  if (data.accessToken) {
    await setTokens(
      data.accessToken,
      data.refreshToken || refreshToken, // Keep old refresh token if not provided
    );
  } else {
    await clearTokens();
    throw new ApiError(401, "응답에 액세스 토큰이 없습니다.");
  }
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
    credentials: "include", // Always include credentials for cookie-based auth
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
        credentials: "include",
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
    let errorMessage = `API 요청 실패 (${res.status})`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new ApiError(res.status, errorMessage);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
