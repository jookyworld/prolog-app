import { useAuth } from "@/contexts/auth-context";
import { COLORS } from "@/lib/constants";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Dumbbell,
  Ruler,
  Settings,
  User,
  Weight,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const genderLabel = user?.gender === "MALE" ? "남성" : "여성";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 px-5">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between py-4">
          <Text className="text-2xl font-bold text-white">내 정보</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/profile/settings")}
            className="rounded-xl bg-white/5 p-2.5"
          >
            <Settings size={20} color={COLORS.white} />
          </Pressable>
        </View>

        {/* 프로필 카드 */}
        <View className="mb-4 rounded-2xl bg-card p-5">
          {/* 상단: 아바타 + 유저 정보 */}
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <User size={28} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl font-bold text-white">
                  {user?.nickname ?? "사용자"}
                </Text>
                <View className="rounded-md bg-primary/15 px-2 py-0.5">
                  <Text className="text-xs font-medium text-primary">
                    {genderLabel}
                  </Text>
                </View>
              </View>
              <Text className="mt-1 text-sm text-white/50">{user?.email}</Text>
            </View>
          </View>

          {/* 구분선 */}
          <View className="my-4 h-px bg-white/5" />

          {/* 하단: 신체 정보 2열 */}
          <View className="flex-row">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Ruler size={18} color={COLORS.mutedForeground} />
              </View>
              <View>
                <Text className="text-xs text-white/40">키</Text>
                <Text className="text-lg font-bold text-white">
                  {user?.height ?? "-"}
                  <Text className="text-xs font-normal text-white/40"> cm</Text>
                </Text>
              </View>
            </View>
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Weight size={18} color={COLORS.mutedForeground} />
              </View>
              <View>
                <Text className="text-xs text-white/40">체중</Text>
                <Text className="text-lg font-bold text-white">
                  {user?.weight ?? "-"}
                  <Text className="text-xs font-normal text-white/40"> kg</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View className="rounded-2xl bg-card">
          <Pressable
            onPress={() => router.push("/(tabs)/profile/history")}
            className="flex-row items-center px-5 py-4"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <Dumbbell size={18} color={COLORS.white} />
            </View>
            <Text className="ml-3 flex-1 text-base text-white">
              운동 기록 보관함
            </Text>
            <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
          </Pressable>

          <View className="mx-5 h-px bg-white/5" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
