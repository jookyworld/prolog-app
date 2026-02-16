import { routineApi } from "@/lib/api/routine";
import { COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { RoutineListItem } from "@/lib/types/routine";
import { Archive, ArrowLeft, ChevronRight, ClipboardList, Plus } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function RoutineScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routineApi.getRoutines("ALL");
      setRoutines(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
    }, [fetchRoutines]),
  );

  const activeRoutines = useMemo(
    () => routines.filter((r) => r.active),
    [routines],
  );
  const archivedRoutines = useMemo(
    () => routines.filter((r) => !r.active),
    [routines],
  );
  const displayedRoutines = showArchived ? archivedRoutines : activeRoutines;

  const handleArchive = async (routine: RoutineListItem) => {
    try {
      await routineApi.archiveRoutine(routine.id);
      await fetchRoutines();
    } catch {
      Alert.alert("오류", "보관에 실패했습니다.");
    }
  };

  const handleActivate = async (routine: RoutineListItem) => {
    try {
      await routineApi.activateRoutine(routine.id);
      await fetchRoutines();
    } catch {
      Alert.alert("오류", "활성화에 실패했습니다.");
    }
  };

  const handleDelete = async (routine: RoutineListItem) => {
    Alert.alert("루틴 삭제", "이 루틴을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await routineApi.deleteRoutine(routine.id);
            await fetchRoutines();
          } catch {
            Alert.alert("오류", "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const handleLongPress = (routine: RoutineListItem) => {
    if (routine.active) {
      Alert.alert(routine.title, undefined, [
        { text: "취소", style: "cancel" },
        {
          text: "보관하기",
          onPress: () => handleArchive(routine),
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => handleDelete(routine),
        },
      ]);
    } else {
      Alert.alert(routine.title, undefined, [
        { text: "취소", style: "cancel" },
        {
          text: "다시 활성화",
          onPress: () => handleActivate(routine),
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => handleDelete(routine),
        },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 py-4">
        {showArchived ? (
          <>
            <View className="flex-row items-center">
              <Pressable
                onPress={() => setShowArchived(false)}
                className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              >
                <ArrowLeft size={20} color={COLORS.white} />
              </Pressable>
              <Text className="text-2xl font-bold text-white">보관된 루틴</Text>
            </View>
            <View className="w-10" />
          </>
        ) : (
          <>
            <Text className="text-2xl font-bold text-white">루틴</Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => router.push("/(tabs)/routine/new")}
                className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              >
                <Plus size={20} color={COLORS.white} />
              </Pressable>
            </View>
          </>
        )}
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
        ) : displayedRoutines.length === 0 ? (
          <View className="rounded-2xl bg-card p-6">
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                {showArchived ? (
                  <Archive size={22} color={COLORS.primary} />
                ) : (
                  <ClipboardList size={22} color={COLORS.primary} />
                )}
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-base font-semibold text-white">
                  {showArchived ? "보관된 루틴이 없어요" : "아직 루틴이 없어요"}
                </Text>
                <Text className="text-sm leading-5 text-white/50">
                  {showArchived
                    ? "보관한 루틴이 여기에 표시됩니다."
                    : "나만의 루틴을 만들어\n효율적으로 운동해보세요!"}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="gap-3 pb-8">
            {displayedRoutines.map((routine) => (
              <Pressable
                key={routine.id}
                onPress={() =>
                  router.push(`/(tabs)/routine/${routine.id}`)
                }
                onLongPress={() => handleLongPress(routine)}
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

            {/* 보관된 루틴 진입 카드 (활성 목록에서만 표시) */}
            {!showArchived && archivedRoutines.length > 0 && (
              <Pressable
                onPress={() => setShowArchived(true)}
                className="flex-row items-center justify-between rounded-2xl bg-white/5 p-5 active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Archive size={18} color="rgba(255,255,255,0.4)" />
                  <Text className="text-sm text-white/60">
                    보관된 루틴 {archivedRoutines.length}개
                  </Text>
                </View>
                <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
