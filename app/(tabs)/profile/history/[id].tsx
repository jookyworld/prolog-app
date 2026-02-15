import { workoutApi } from "@/lib/api/workout";
import { COLORS } from "@/lib/constants";
import {
  WorkoutSessionDetail,
  toWorkoutSessionDetail,
} from "@/lib/types/workout";
import { ArrowLeft, Calendar, Clock, Flame, Layers } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function WorkoutHistoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await workoutApi.getSessionDetail(id);
      setSession(toWorkoutSessionDetail(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text className="mt-3 text-sm text-white/50">불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-lg font-semibold text-white">
          {error ?? "기록을 찾을 수 없어요"}
        </Text>
        <Text className="mb-6 text-sm text-white/50">
          삭제되었거나 존재하지 않는 기록입니다.
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={fetchDetail}
            className="rounded-full bg-white/10 px-5 py-2.5"
          >
            <Text className="text-sm font-medium text-white">다시 시도</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-primary px-5 py-2.5"
          >
            <Text className="text-sm font-medium text-white">목록으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <ArrowLeft size={20} color={COLORS.white} />
        </Pressable>
        <Text className="text-2xl font-bold text-white">기록 상세</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* 요약 카드 */}
        <View className="mb-4 rounded-2xl bg-card p-5">
          <View className="mb-4 flex-row items-center gap-2">
            <Text className="flex-1 text-xl font-bold text-white">
              {session.title}
            </Text>
            <View
              className={`rounded-md px-2.5 py-1 ${
                session.type === "routine" ? "bg-primary/15" : "bg-white/10"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  session.type === "routine" ? "text-primary" : "text-white/50"
                }`}
              >
                {session.type === "routine" ? "루틴" : "자유"}
              </Text>
            </View>
          </View>

          {/* 통계 그리드 */}
          <View className="flex-row flex-wrap gap-y-3">
            <View className="w-1/2 flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <Calendar size={16} color={COLORS.mutedForeground} />
              </View>
              <View>
                <Text className="text-xs text-white/40">날짜</Text>
                <Text className="text-sm font-medium text-white">
                  {formatDate(session.completedAt)}
                </Text>
              </View>
            </View>
            <View className="w-1/2 flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <Clock size={16} color={COLORS.mutedForeground} />
              </View>
              <View>
                <Text className="text-xs text-white/40">운동 시간</Text>
                <Text className="text-sm font-medium text-white">
                  {session.elapsedTime > 0
                    ? formatElapsedTime(session.elapsedTime)
                    : "-"}
                </Text>
              </View>
            </View>
            <View className="w-1/2 flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <Layers size={16} color={COLORS.mutedForeground} />
              </View>
              <View>
                <Text className="text-xs text-white/40">총 세트</Text>
                <Text className="text-sm font-medium text-white">
                  {session.totalSets}세트
                </Text>
              </View>
            </View>
            <View className="w-1/2 flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <Flame size={16} color={COLORS.mutedForeground} />
              </View>
              <View>
                <Text className="text-xs text-white/40">총 볼륨</Text>
                <Text className="text-sm font-medium text-white">
                  {session.totalVolume.toLocaleString()} kg
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 운동별 세트 카드 */}
        <View className="gap-3 pb-8">
          {session.exercises
            .sort((a, b) => a.orderNo - b.orderNo)
            .map((exercise) => {
              const volume = exercise.sets.reduce(
                (sum, s) => sum + s.weight * s.reps,
                0,
              );
              return (
                <View key={exercise.id} className="rounded-2xl bg-card p-5">
                  {/* 운동 헤더 */}
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-white">
                      {exercise.name}
                    </Text>
                    <Text className="text-sm font-medium text-primary">
                      {volume.toLocaleString()} kg
                    </Text>
                  </View>

                  {/* 세트 테이블 헤더 */}
                  <View className="mb-2 flex-row px-1">
                    <Text className="w-12 text-center text-xs text-white/30">
                      세트
                    </Text>
                    <Text className="flex-1 text-center text-xs text-white/30">
                      kg
                    </Text>
                    <Text className="flex-1 text-center text-xs text-white/30">
                      회
                    </Text>
                  </View>

                  {/* 세트 행 */}
                  <View className="gap-2">
                    {exercise.sets.map((set) => (
                      <View
                        key={set.id}
                        className="flex-row items-center"
                      >
                        <Text className="w-12 text-center text-sm font-medium text-primary/50">
                          {set.setNo}
                        </Text>
                        <View className="mx-1 flex-1 items-center rounded-xl bg-white/5 py-3">
                          <Text className="text-sm font-medium text-white">
                            {set.weight}
                            <Text className="text-xs text-white/30"> kg</Text>
                          </Text>
                        </View>
                        <View className="mx-1 flex-1 items-center rounded-xl bg-white/5 py-3">
                          <Text className="text-sm font-medium text-white">
                            {set.reps}
                            <Text className="text-xs text-white/30"> 회</Text>
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
