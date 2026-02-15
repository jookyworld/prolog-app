export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  nickname: string;
  gender: "MALE" | "FEMALE";
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
  gender: "MALE" | "FEMALE";
  height: number;
  weight: number;
}

export interface LoginResponse {
  userResponse: UserResponse;
  accessToken: string;
  refreshToken: string;
}
