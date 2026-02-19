import { apiFetch } from "../api";
import type { UpdateProfileRequest, UserResponse } from "../types/auth";

export const userApi = {
  updateProfile(req: UpdateProfileRequest): Promise<UserResponse> {
    return apiFetch("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(req),
    });
  },
};
