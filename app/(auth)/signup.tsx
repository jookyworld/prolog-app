import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/contexts/auth-context";
import { COLORS } from "@/lib/constants";
import type { SignupRequest } from "@/lib/types/auth";
import {
  signupStep1Schema,
  signupStep2Schema,
  type SignupStep1Values,
  type SignupStep2Values,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<SignupStep1Values | null>(null);
  const [error, setError] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="flex-1 bg-background px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-8">
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-white">회원가입</Text>
            <Text className="text-sm text-muted-foreground">
              {step === 1
                ? "계정 정보를 입력하세요"
                : "신체 정보를 입력하세요"}
            </Text>
            <View className="flex-row justify-center gap-2 pt-2">
              <View
                className={`h-1 w-12 rounded-full ${step >= 1 ? "bg-primary" : "bg-border"}`}
              />
              <View
                className={`h-1 w-12 rounded-full ${step >= 2 ? "bg-primary" : "bg-border"}`}
              />
            </View>
          </View>

          {error ? (
            <Text className="text-center text-sm text-red-400">{error}</Text>
          ) : null}

          {step === 1 ? (
            <Step1Form
              onNext={(data) => {
                setStep1Data(data);
                setStep(2);
              }}
            />
          ) : (
            <Step2Form
              onBack={() => setStep(1)}
              onSubmit={async (data) => {
                setError("");
                try {
                  const req: SignupRequest = { ...step1Data!, ...data };
                  await signup(req);
                  router.replace("/(tabs)");
                } catch {
                  setError("회원가입에 실패했습니다. 다시 시도해주세요.");
                }
              }}
            />
          )}

          <View className="flex-row justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-sm text-primary">로그인</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Step1Form({
  onNext,
}: {
  onNext: (data: SignupStep1Values) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupStep1Values>({
    resolver: zodResolver(signupStep1Schema),
  });

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label>아이디</Label>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="4자 이상"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.username && (
          <Text className="text-xs text-red-400">
            {errors.username.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Label>비밀번호</Label>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="8자 이상"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text className="text-xs text-red-400">
            {errors.password.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Label>이메일</Label>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text className="text-xs text-red-400">{errors.email.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>닉네임</Label>
        <Controller
          control={control}
          name="nickname"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="2~10자"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.nickname && (
          <Text className="text-xs text-red-400">
            {errors.nickname.message}
          </Text>
        )}
      </View>

      <Button onPress={handleSubmit(onNext)} className="w-full">
        다음
      </Button>
    </View>
  );
}

function Step2Form({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (data: SignupStep2Values) => Promise<void>;
}) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupStep2Values>({
    resolver: zodResolver(signupStep2Schema),
  });

  const gender = watch("gender");

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label>성별</Label>
        <View className="flex-row gap-3">
          {(["MALE", "FEMALE"] as const).map((g) => (
            <Pressable
              key={g}
              onPress={() => setValue("gender", g, { shouldValidate: true })}
              className={`h-12 flex-1 items-center justify-center rounded-xl border ${
                gender === g
                  ? "border-primary bg-primary"
                  : "border-border bg-card"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  gender === g ? "text-white" : "text-muted-foreground"
                }`}
              >
                {g === "MALE" ? "남성" : "여성"}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.gender && (
          <Text className="text-xs text-red-400">{errors.gender.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>키 (cm)</Label>
        <Controller
          control={control}
          name="height"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="170"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => {
                const num = Number(text);
                onChange(text === "" ? undefined : num);
              }}
              value={value != null ? String(value) : ""}
            />
          )}
        />
        {errors.height && (
          <Text className="text-xs text-red-400">{errors.height.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>체중 (kg)</Label>
        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="70"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => {
                const num = Number(text);
                onChange(text === "" ? undefined : num);
              }}
              value={value != null ? String(value) : ""}
            />
          )}
        />
        {errors.weight && (
          <Text className="text-xs text-red-400">{errors.weight.message}</Text>
        )}
      </View>

      <View className="flex-row gap-3">
        <Button variant="outline" size="icon" onPress={onBack}>
          <ArrowLeft size={16} color={COLORS.white} />
        </Button>
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "가입 중..." : "가입 완료"}
        </Button>
      </View>
    </View>
  );
}
