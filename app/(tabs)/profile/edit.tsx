import { useAuth } from "@/contexts/auth-context";
import { userApi } from "@/lib/api/user";
import { COLORS } from "@/lib/constants";
import type { Gender } from "@/lib/types/auth";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
  { value: "UNKNOWN", label: "미설정" },
];

export default function ProfileEditScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [gender, setGender] = useState<Gender>(user?.gender ?? "UNKNOWN");
  const [height, setHeight] = useState(user?.height?.toString() ?? "");
  const [weight, setWeight] = useState(user?.weight?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert("알림", "닉네임을 입력해주세요.");
      return;
    }

    const h = Number(height);
    const w = Number(weight);

    if (!h || h <= 0) {
      Alert.alert("알림", "올바른 키를 입력해주세요.");
      return;
    }
    if (!w || w <= 0) {
      Alert.alert("알림", "올바른 체중을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const updated = await userApi.updateProfile({
        nickname: nickname.trim(),
        gender,
        height: h,
        weight: w,
      });
      updateUser(updated);
      router.back();
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "프로필 수정에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color={COLORS.white} />
        </Pressable>
        <Text className="text-lg font-bold text-white">프로필 수정</Text>
        <Pressable onPress={handleSave} disabled={saving} className="p-1">
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text className="text-base font-medium text-primary">저장</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Nickname */}
          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium text-white/60">
              닉네임
            </Text>
            <TextInput
              className="rounded-xl bg-card px-4 py-3.5 text-base text-white"
              placeholder="닉네임"
              placeholderTextColor={COLORS.placeholder}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
            />
          </View>

          {/* Gender */}
          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium text-white/60">성별</Text>
            <View className="flex-row gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setGender(opt.value)}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    gender === opt.value ? "bg-primary" : "bg-card"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      gender === opt.value ? "text-white" : "text-white/50"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Height */}
          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium text-white/60">
              키 (cm)
            </Text>
            <TextInput
              className="rounded-xl bg-card px-4 py-3.5 text-base text-white"
              placeholder="0"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>

          {/* Weight */}
          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium text-white/60">
              체중 (kg)
            </Text>
            <TextInput
              className="rounded-xl bg-card px-4 py-3.5 text-base text-white"
              placeholder="0"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
