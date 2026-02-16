import { useAuth } from "@/contexts/auth-context";
import { COLORS } from "@/lib/constants";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { logout, deleteAccount } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("오류", "로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace("/(auth)/login");
            } catch {
              Alert.alert("오류", "회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-5">
        {/* 헤더 */}
        <View className="flex-row items-center py-4">
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl bg-white/5 p-2.5 mr-3"
          >
            <ArrowLeft size={20} color={COLORS.white} />
          </Pressable>
          <Text className="text-2xl font-bold text-white">설정</Text>
        </View>

        {/* 로그아웃 */}
        <Pressable
          onPress={handleLogout}
          className="mt-3 flex-row items-center rounded-2xl bg-card px-5 py-4"
        >
          <View className="rounded-xl bg-white/5 p-2.5 mr-3">
            <LogOut size={20} color={COLORS.white} />
          </View>
          <Text className="flex-1 text-base text-white">로그아웃</Text>
        </Pressable>

        {/* 회원 탈퇴 */}
        <Pressable
          onPress={handleDeleteAccount}
          className="mt-3 flex-row items-center rounded-2xl bg-card px-5 py-4"
        >
          <View className="rounded-xl bg-white/5 p-2.5 mr-3">
            <Trash2 size={20} color={COLORS.destructive} />
          </View>
          <Text className="flex-1 text-base" style={{ color: COLORS.destructive }}>
            회원 탈퇴
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
