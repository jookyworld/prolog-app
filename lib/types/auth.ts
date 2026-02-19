export type Gender = "MALE" | "FEMALE" | "UNKNOWN";

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  nickname: string;
  gender: Gender;
  height: number;
  weight: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nickname: string;
  gender: Gender;
  height: number;
  weight: number;
  role: string;
  createdAt: string;
}

export interface LoginResponse {
  userResponse: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  nickname: string;
  gender: Gender;
  height: number;
  weight: number;
}
