import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const signupStep1Schema = z.object({
  username: z
    .string()
    .min(4, "아이디는 4자 이상이어야 합니다")
    .max(20, "아이디는 20자 이하여야 합니다"),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .max(30, "비밀번호는 30자 이하여야 합니다"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다")
    .max(10, "닉네임은 10자 이하여야 합니다"),
});

export const signupStep2Schema = z.object({
  gender: z.enum(["MALE", "FEMALE"], {
    message: "성별을 선택해주세요",
  }),
  height: z
    .number()
    .min(100, "키는 100cm 이상이어야 합니다")
    .max(250, "키는 250cm 이하여야 합니다"),
  weight: z
    .number()
    .min(30, "체중은 30kg 이상이어야 합니다")
    .max(300, "체중은 300kg 이하여야 합니다"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupStep1Values = z.infer<typeof signupStep1Schema>;
export type SignupStep2Values = z.infer<typeof signupStep2Schema>;
