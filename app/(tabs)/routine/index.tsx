import { routineApi } from "@/lib/api/routine";
import { COLORS } from "@/lib/constants";
import type { RoutineListItem } from "@/lib/types/routine";
import { ClipboardList, Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RoutineScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routineApi.getRoutines();
      setRoutines(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-2xl font-bold text-white">루틴</Text>
        <Pressable
          onPress={() => {}}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <Plus size={20} color={COLORS.white} />
        </Pressable>
      </View>

      {/* 컨텐츠 */}
      <ScrollView className="flex-1 px-5">
        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="mt-3 text-sm text-white/50">불러오는 중...</Text>
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl bg-card p-8">
            <Text className="mb-4 text-sm text-white/60">{error}</Text>
            <Pressable
              onPress={fetchRoutines}
              className="rounded-full bg-white/10 px-5 py-2.5"
            >
              <Text className="text-sm font-medium text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : routines.length === 0 ? (
          <View className="rounded-2xl bg-card p-6">
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                <ClipboardList size={22} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-base font-semibold text-white">
                  아직 루틴이 없어요
                </Text>
                <Text className="text-sm leading-5 text-white/50">
                  나만의 루틴을 만들어{"\n"}효율적으로 운동해보세요!
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="gap-3 pb-8">
            {routines.map((routine) => (
              <Pressable
                key={routine.id}
                onPress={() =>
                  router.push(`/(tabs)/routine/${routine.id}`)
                }
                className="rounded-2xl bg-card p-5 active:opacity-80"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="flex-1 text-base font-semibold text-white">
                    {routine.title}
                  </Text>
                  {routine.active && (
                    <View className="rounded-md bg-primary/15 px-2 py-0.5">
                      <Text className="text-xs font-medium text-primary">
                        활성
                      </Text>
                    </View>
                  )}
                </View>
                {routine.description ? (
                  <Text
                    className="mb-2 text-sm text-white/50"
                    numberOfLines={2}
                  >
                    {routine.description}
                  </Text>
                ) : null}
                <Text className="text-xs text-white/30">
                  {formatDate(routine.createdAt)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
