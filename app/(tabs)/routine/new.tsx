import { routineApi } from "@/lib/api/routine";
import { COLORS } from "@/lib/constants";
import { formatRestTime } from "@/lib/format";
import { getSelectedExercises } from "@/lib/store/exercise-selection";
import type { ExerciseResponse } from "@/lib/types/exercise";
import { BODY_PART_LABEL } from "@/lib/types/exercise";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Minus,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useCallback, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";

interface RoutineItem {
  exercise: ExerciseResponse;
  sets: number;
  restSeconds: number;
}

export default function NewRoutineScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const selected = getSelectedExercises();
      if (selected.length > 0) {
        setItems((prev) => [
          ...prev,
          ...selected.map((exercise) => ({
            exercise,
            sets: 4,
            restSeconds: 90,
          })),
        ]);
      }
    }, []),
  );

  const canSave = title.trim().length > 0 && items.length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await routineApi.createRoutine({
        title: title.trim(),
        description: description.trim(),
        routineItems: items.map((item) => ({
          exerciseId: item.exercise.id,
          sets: item.sets,
          restSeconds: item.restSeconds,
        })),
      });
      router.back();
    } catch {
      Alert.alert("오류", "루틴 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (index: number, update: Partial<RoutineItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...update } : item)),
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/5"
          >
            <ArrowLeft size={20} color={COLORS.white} />
          </Pressable>
          <Text className="text-2xl font-bold text-white">루틴 만들기</Text>
        </View>
        <Pressable
          onPress={handleSave}
          disabled={!canSave || saving}
          className="rounded-xl px-4 py-2"
          style={{ backgroundColor: canSave ? COLORS.primary : "rgba(255,255,255,0.05)" }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text
              className="text-sm font-semibold"
              style={{ color: canSave ? COLORS.white : "rgba(255,255,255,0.3)" }}
            >
              저장
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* 루틴 정보 */}
        <View className="mb-4 rounded-2xl bg-card p-5">
          <Text className="mb-2 text-sm font-medium text-white/60">
            루틴 이름 *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="예: 상체 루틴 A"
            placeholderTextColor={COLORS.placeholder}
            className="mb-4 rounded-xl bg-white/5 px-4 py-3 text-base text-white"
          />
          <Text className="mb-2 text-sm font-medium text-white/60">설명</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="루틴에 대한 간단한 설명 (선택)"
            placeholderTextColor={COLORS.placeholder}
            multiline
            numberOfLines={3}
            className="rounded-xl bg-white/5 px-4 py-3 text-base text-white"
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        {/* 구성 종목 */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-white/80">
            구성 종목 ({items.length}개)
          </Text>
        </View>

        {items.length === 0 ? (
          <View className="mb-4 items-center rounded-2xl bg-card p-8">
            <Text className="text-sm text-white/40">
              아래 버튼으로 운동 종목을 추가하세요
            </Text>
          </View>
        ) : (
          <View className="mb-4 gap-3">
            {items.map((item, idx) => (
              <View key={`${item.exercise.id}-${idx}`} className="rounded-2xl bg-card p-4">
                {/* 운동명 + 순서/삭제 */}
                <View className="mb-3 flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                    <Text className="text-sm font-bold text-primary">
                      {idx + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-white">
                      {item.exercise.name}
                    </Text>
                    <Text className="text-xs text-white/40">
                      {BODY_PART_LABEL[item.exercise.bodyPart] ?? item.exercise.bodyPart}
                      {item.exercise.partDetail
                        ? ` · ${item.exercise.partDetail}`
                        : ""}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Pressable
                      onPress={() => moveItem(idx, "up")}
                      disabled={idx === 0}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-white/5"
                    >
                      <ChevronUp
                        size={16}
                        color={idx === 0 ? "rgba(255,255,255,0.15)" : COLORS.white}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => moveItem(idx, "down")}
                      disabled={idx === items.length - 1}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-white/5"
                    >
                      <ChevronDown
                        size={16}
                        color={
                          idx === items.length - 1
                            ? "rgba(255,255,255,0.15)"
                            : COLORS.white
                        }
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => removeItem(idx)}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-destructive/10"
                    >
                      <Trash2 size={14} color={COLORS.destructive} />
                    </Pressable>
                  </View>
                </View>

                {/* 세트 수 조절 */}
                <View className="mb-2 flex-row items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <View className="flex-row items-center gap-2">
                    <Layers size={14} color={COLORS.mutedForeground} />
                    <Text className="text-sm text-white/60">세트</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() =>
                        updateItem(idx, {
                          sets: Math.max(1, item.sets - 1),
                        })
                      }
                      disabled={item.sets <= 1}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-white/10"
                    >
                      <Minus
                        size={14}
                        color={
                          item.sets <= 1
                            ? "rgba(255,255,255,0.15)"
                            : COLORS.white
                        }
                      />
                    </Pressable>
                    <Text className="w-8 text-center text-base font-semibold text-white">
                      {item.sets}
                    </Text>
                    <Pressable
                      onPress={() =>
                        updateItem(idx, {
                          sets: Math.min(20, item.sets + 1),
                        })
                      }
                      disabled={item.sets >= 20}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-white/10"
                    >
                      <Plus
                        size={14}
                        color={
                          item.sets >= 20
                            ? "rgba(255,255,255,0.15)"
                            : COLORS.white
                        }
                      />
                    </Pressable>
                  </View>
                </View>

                {/* 휴식 시간 조절 */}
                <View className="flex-row items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <View className="flex-row items-center gap-2">
                    <Clock size={14} color={COLORS.mutedForeground} />
                    <Text className="text-sm text-white/60">휴식</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() =>
                        updateItem(idx, {
                          restSeconds: Math.max(0, item.restSeconds - 30),
                        })
                      }
                      disabled={item.restSeconds <= 0}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-white/10"
                    >
                      <Minus
                        size={14}
                        color={
                          item.restSeconds <= 0
                            ? "rgba(255,255,255,0.15)"
                            : COLORS.white
                        }
                      />
                    </Pressable>
                    <Text className="min-w-[60px] text-center text-base font-semibold text-white">
                      {formatRestTime(item.restSeconds)}
                    </Text>
                    <Pressable
                      onPress={() =>
                        updateItem(idx, {
                          restSeconds: Math.min(600, item.restSeconds + 30),
                        })
                      }
                      disabled={item.restSeconds >= 600}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-white/10"
                    >
                      <Plus
                        size={14}
                        color={
                          item.restSeconds >= 600
                            ? "rgba(255,255,255,0.15)"
                            : COLORS.white
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 종목 추가 버튼 */}
        <Pressable
          onPress={() => router.push("/(tabs)/routine/select-exercises")}
          className="mb-8 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed py-4 active:opacity-80"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <Plus size={18} color={COLORS.primary} />
          <Text className="text-sm font-semibold text-primary">종목 추가</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
