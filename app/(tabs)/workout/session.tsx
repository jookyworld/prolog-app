import { routineApi } from "@/lib/api/routine";
import { workoutApi } from "@/lib/api/workout";
import { COLORS } from "@/lib/constants";
import { formatElapsedTime } from "@/lib/format";
import type { ActiveExercise, ActiveSet } from "@/lib/types/workout";
import {
  Check,
  ChevronRight,
  Clock,
  Minus,
  Plus,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();

  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [routineTitle, setRoutineTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setIdCounter = useRef(0);

  const nextSetId = useCallback(() => {
    return `set-${++setIdCounter.current}`;
  }, []);

  // Initialize session
  useEffect(() => {
    if (!routineId) return;

    const init = async () => {
      try {
        const [routine, session] = await Promise.all([
          routineApi.getRoutineDetail(Number(routineId)),
          workoutApi.startSession(Number(routineId)),
        ]);

        setRoutineTitle(routine.title);
        setSessionId(session.id);

        const sorted = [...routine.routineItems].sort(
          (a, b) => a.orderInRoutine - b.orderInRoutine,
        );

        const activeExercises: ActiveExercise[] = sorted.map((item) => ({
          id: String(item.routineItemId),
          exerciseId: item.exerciseId,
          name: item.exerciseName,
          sets: Array.from({ length: item.sets }, (_, i) => ({
            id: nextSetId(),
            setNumber: i + 1,
            weight: "",
            reps: "",
            completed: false,
          })),
        }));

        setExercises(activeExercises);
      } catch (err) {
        Alert.alert(
          "오류",
          err instanceof Error ? err.message : "세션을 시작할 수 없습니다.",
          [{ text: "확인", onPress: () => router.back() }],
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [routineId, router]);

  // Timer
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const currentExercise = exercises[currentIndex];

  const updateSet = useCallback(
    (exerciseIdx: number, setId: string, updates: Partial<ActiveSet>) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i === exerciseIdx
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setId ? { ...s, ...updates } : s,
                ),
              }
            : ex,
        ),
      );
    },
    [],
  );

  const addSet = useCallback((exerciseIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIdx
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: nextSetId(),
                  setNumber: ex.sets.length + 1,
                  weight: "",
                  reps: "",
                  completed: false,
                },
              ],
            }
          : ex,
      ),
    );
  }, []);

  const removeSet = useCallback((exerciseIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIdx || ex.sets.length <= 1) return ex;
        const newSets = ex.sets.slice(0, -1);
        return { ...ex, sets: newSets };
      }),
    );
  }, []);

  const handleComplete = () => {
    const completedSets = exercises.flatMap((ex) =>
      ex.sets
        .filter((s) => s.completed && s.weight && s.reps)
        .map((s) => ({
          exerciseId: ex.exerciseId,
          setNumber: s.setNumber,
          weight: Number(s.weight),
          reps: Number(s.reps),
        })),
    );

    if (completedSets.length === 0) {
      Alert.alert("알림", "완료된 세트가 없습니다.");
      return;
    }

    Alert.alert(
      "운동 완료",
      `${completedSets.length}개 세트를 기록합니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "완료",
          onPress: async () => {
            if (!sessionId) return;
            setCompleting(true);
            try {
              await workoutApi.completeSession(sessionId, {
                action: "RECORD_ONLY",
                sets: completedSets,
              });
              router.back();
            } catch (err) {
              Alert.alert(
                "오류",
                err instanceof Error
                  ? err.message
                  : "운동 완료 처리에 실패했습니다.",
              );
            } finally {
              setCompleting(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert("운동 중단", "운동을 중단하시겠습니까?\n기록이 저장되지 않습니다.", [
      { text: "계속하기", style: "cancel" },
      {
        text: "그만하기",
        style: "destructive",
        onPress: async () => {
          if (sessionId) {
            try {
              await workoutApi.cancelSession(sessionId);
            } catch {
              // ignore cancel error
            }
          }
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text className="mt-3 text-sm text-white/50">운동 준비 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable onPress={handleCancel}>
          <Text className="text-base font-medium text-destructive">
            그만하기
          </Text>
        </Pressable>
        <Text
          className="flex-1 text-center text-base font-bold text-white"
          numberOfLines={1}
        >
          {routineTitle}
        </Text>
        <Pressable onPress={handleComplete} disabled={completing}>
          {completing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text className="text-base font-medium text-primary">완료</Text>
          )}
        </Pressable>
      </View>

      {/* Exercise tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-11 border-b border-white/10 px-3"
        contentContainerStyle={{ alignItems: "center", gap: 4 }}
      >
        {exercises.map((ex, idx) => (
          <Pressable
            key={ex.id}
            onPress={() => setCurrentIndex(idx)}
            className={`rounded-full px-4 py-2 ${
              idx === currentIndex ? "bg-primary" : "bg-white/5"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                idx === currentIndex ? "text-white" : "text-white/50"
              }`}
              numberOfLines={1}
            >
              {ex.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Exercise content */}
      {currentExercise && (
        <ScrollView
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-4 text-xl font-bold text-white">
            {currentExercise.name}
          </Text>

          {/* Set table header */}
          <View className="mb-2 flex-row items-center px-1">
            <Text className="w-10 text-center text-xs font-medium text-white/40">
              세트
            </Text>
            <Text className="flex-1 text-center text-xs font-medium text-white/40">
              무게(kg)
            </Text>
            <Text className="flex-1 text-center text-xs font-medium text-white/40">
              횟수
            </Text>
            <View className="w-11" />
          </View>

          {/* Set rows */}
          <View className="gap-2">
            {currentExercise.sets.map((set) => (
              <View
                key={set.id}
                className={`flex-row items-center rounded-xl px-1 py-2 ${
                  set.completed ? "bg-primary/10" : "bg-card"
                }`}
              >
                <Text className="w-10 text-center text-sm font-bold text-white/60">
                  {set.setNumber}
                </Text>
                <View className="mx-1 flex-1">
                  <TextInput
                    className="rounded-lg bg-white/5 px-3 py-2.5 text-center text-sm text-white"
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="numeric"
                    value={set.weight}
                    onChangeText={(v) =>
                      updateSet(currentIndex, set.id, { weight: v })
                    }
                  />
                </View>
                <View className="mx-1 flex-1">
                  <TextInput
                    className="rounded-lg bg-white/5 px-3 py-2.5 text-center text-sm text-white"
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="numeric"
                    value={set.reps}
                    onChangeText={(v) =>
                      updateSet(currentIndex, set.id, { reps: v })
                    }
                  />
                </View>
                <Pressable
                  onPress={() =>
                    updateSet(currentIndex, set.id, {
                      completed: !set.completed,
                    })
                  }
                  className={`ml-1 h-9 w-9 items-center justify-center rounded-lg ${
                    set.completed ? "bg-primary" : "bg-white/5"
                  }`}
                >
                  <Check
                    size={16}
                    color={set.completed ? COLORS.white : COLORS.iconMuted}
                  />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Add / Remove set buttons */}
          <View className="mt-3 flex-row justify-center gap-3 pb-6">
            <Pressable
              onPress={() => removeSet(currentIndex)}
              className="flex-row items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2.5 active:opacity-80"
            >
              <Minus size={14} color={COLORS.mutedForeground} />
              <Text className="text-sm text-white/60">세트 삭제</Text>
            </Pressable>
            <Pressable
              onPress={() => addSet(currentIndex)}
              className="flex-row items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2.5 active:opacity-80"
            >
              <Plus size={14} color={COLORS.mutedForeground} />
              <Text className="text-sm text-white/60">세트 추가</Text>
            </Pressable>
          </View>

          {/* Next exercise button */}
          {currentIndex < exercises.length - 1 && (
            <Pressable
              onPress={() => setCurrentIndex(currentIndex + 1)}
              className="mb-6 flex-row items-center justify-center gap-2 rounded-2xl bg-primary/10 py-4 active:opacity-80"
            >
              <Text className="text-base font-semibold text-primary">
                다음 운동
              </Text>
              <ChevronRight size={18} color={COLORS.primary} />
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* Bottom timer bar */}
      <View className="flex-row items-center justify-center gap-2 border-t border-white/10 px-5 py-3">
        <Clock size={16} color={COLORS.mutedForeground} />
        <Text className="text-base font-mono font-semibold text-white/60">
          {formatElapsedTime(elapsedTime)}
        </Text>
      </View>
    </SafeAreaView>
  );
}
