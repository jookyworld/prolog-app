import { routineApi } from "@/lib/api/routine";
import { COLORS } from "@/lib/constants";
import type { RoutineDetail } from "@/lib/types/routine";
import { ArrowLeft, Clock, Layers, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function RoutineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [routine, setRoutine] = useState<RoutineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await routineApi.getRoutineDetail(Number(id));
      setRoutine(data);
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

  const handleDelete = () => {
    Alert.alert("루틴 삭제", "이 루틴을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await routineApi.deleteRoutine(Number(id));
            router.back();
          } catch {
            Alert.alert("오류", "삭제에 실패했습니다.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text className="mt-3 text-sm text-white/50">불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !routine) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-lg font-semibold text-white">
          {error ?? "루틴을 찾을 수 없어요"}
        </Text>
        <Text className="mb-6 text-sm text-white/50">
          삭제되었거나 존재하지 않는 루틴입니다.
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

  const sortedItems = [...routine.routineItems].sort(
    (a, b) => a.orderInRoutine - b.orderInRoutine,
  );

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
        <Text className="text-2xl font-bold text-white">루틴 상세</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* 요약 카드 */}
        <View className="mb-4 rounded-2xl bg-card p-5">
          <View className="mb-2 flex-row items-center gap-2">
            <Text className="flex-1 text-xl font-bold text-white">
              {routine.title}
            </Text>
            {routine.active && (
              <View className="rounded-md bg-primary/15 px-2.5 py-1">
                <Text className="text-xs font-medium text-primary">활성</Text>
              </View>
            )}
          </View>
          {routine.description ? (
            <Text className="text-sm leading-5 text-white/50">
              {routine.description}
            </Text>
          ) : null}
        </View>

        {/* 운동 구성 */}
        <Text className="mb-3 text-base font-semibold text-white/80">
          운동 구성 ({sortedItems.length}개)
        </Text>

        <View className="gap-3 pb-8">
          {sortedItems.map((item, idx) => (
            <View key={item.routineItemId} className="rounded-2xl bg-card p-5">
              <View className="mb-3 flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <Text className="text-sm font-bold text-primary">
                    {idx + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">
                    {item.exerciseName}
                  </Text>
                  <Text className="text-xs text-white/40">
                    {item.bodyPart}
                    {item.partDetail ? ` · ${item.partDetail}` : ""}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-row items-center gap-1.5">
                  <View className="h-7 w-7 items-center justify-center rounded-md bg-white/5">
                    <Layers size={14} color={COLORS.mutedForeground} />
                  </View>
                  <Text className="text-sm text-white/60">
                    {item.sets}세트
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="h-7 w-7 items-center justify-center rounded-md bg-white/5">
                    <Clock size={14} color={COLORS.mutedForeground} />
                  </View>
                  <Text className="text-sm text-white/60">
                    휴식 {item.restSeconds}초
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 하단 삭제 버튼 */}
      <View className="px-5 pb-8 pt-2">
        <Pressable
          onPress={handleDelete}
          disabled={deleting}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-4 active:opacity-80"
        >
          {deleting ? (
            <ActivityIndicator size="small" color={COLORS.destructive} />
          ) : (
            <Trash2 size={18} color={COLORS.destructive} />
          )}
          <Text className="text-base font-semibold text-destructive">
            {deleting ? "삭제 중..." : "루틴 삭제"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
