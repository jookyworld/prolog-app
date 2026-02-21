import { exerciseApi } from "@/lib/api/exercise";
import { COLORS } from "@/lib/constants";
import { setSelectedExercises } from "@/lib/store/exercise-selection";
import type { BodyPart, ExerciseResponse } from "@/lib/types/exercise";
import { BODY_PARTS, BODY_PART_LABEL } from "@/lib/types/exercise";
import { ArrowLeft, Check, Plus, Search, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SelectExercisesScreen() {
  const router = useRouter();
  const { returnTo, routineId: returnRoutineId } = useLocalSearchParams<{
    returnTo?: string;
    routineId?: string;
  }>();
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filterBodyPart, setFilterBodyPart] = useState<BodyPart | null>(null);
  const [search, setSearch] = useState("");

  // Custom exercise creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBodyPart, setNewBodyPart] = useState<BodyPart>("CHEST");
  const [newPartDetail, setNewPartDetail] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchExercises = useCallback(async () => {
    try {
      const data = await exerciseApi.getExercises();
      setExercises(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "운동 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Reset selection when screen is focused
  useFocusEffect(
    useCallback(() => {
      setSelectedIds(new Set());
      setSearch("");
      setFilterBodyPart(null);
    }, []),
  );

  const filtered = useMemo(() => {
    let list = exercises;
    if (filterBodyPart) {
      list = list.filter((e) => e.bodyPart === filterBodyPart);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [exercises, filterBodyPart, search]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleConfirm = () => {
    const selected = exercises.filter((e) => selectedIds.has(e.id));
    setSelectedExercises(selected);

    if (returnTo === "workout" && returnRoutineId) {
      // Return to workout session
      router.push(`/(tabs)/workout/session?routineId=${returnRoutineId}`);
    } else {
      // Return to routine creation/edit
      router.back();
    }
  };

  const handleCreateCustom = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      Alert.alert("알림", "운동 이름을 입력해주세요.");
      return;
    }

    setCreating(true);
    try {
      const created = await exerciseApi.createCustomExercise({
        name: trimmedName,
        bodyPart: newBodyPart,
        ...(newPartDetail.trim() ? { partDetail: newPartDetail.trim() } : {}),
      });
      setExercises((prev) => [...prev, created]);
      setSelectedIds((prev) => new Set(prev).add(created.id));
      setShowCreateModal(false);
      setNewName("");
      setNewPartDetail("");
      setNewBodyPart("CHEST");
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "종목 생성에 실패했습니다.",
      );
    } finally {
      setCreating(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ExerciseResponse }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <Pressable
          onPress={() => toggleSelect(item.id)}
          className="flex-row items-center gap-4 px-5 py-3.5 active:opacity-80"
          style={isSelected ? { backgroundColor: "rgba(49,130,246,0.08)" } : undefined}
        >
          <View
            className="h-6 w-6 items-center justify-center rounded-md"
            style={{
              backgroundColor: isSelected ? COLORS.primary : "rgba(255,255,255,0.08)",
              borderWidth: isSelected ? 0 : 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            {isSelected && <Check size={14} color={COLORS.white} />}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base text-white">{item.name}</Text>
              {item.custom && (
                <View className="rounded bg-white/10 px-1.5 py-0.5">
                  <Text className="text-[10px] text-white/40">커스텀</Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-white/40">
              {BODY_PART_LABEL[item.bodyPart] ?? item.bodyPart}
              {item.partDetail ? ` · ${item.partDetail}` : ""}
            </Text>
          </View>
        </Pressable>
      );
    },
    [selectedIds, toggleSelect],
  );

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
          <Text className="text-2xl font-bold text-white">종목 선택</Text>
        </View>
        <Pressable
          onPress={handleConfirm}
          disabled={selectedIds.size === 0}
          className="rounded-xl px-4 py-2"
          style={{
            backgroundColor:
              selectedIds.size > 0 ? COLORS.primary : "rgba(255,255,255,0.05)",
          }}
        >
          <Text
            className="text-sm font-semibold"
            style={{
              color:
                selectedIds.size > 0 ? COLORS.white : "rgba(255,255,255,0.3)",
            }}
          >
            확인{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </Text>
        </Pressable>
      </View>

      {/* 검색 + 커스텀 종목 생성 */}
      <View className="mx-5 mb-3 flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-white/5 px-4">
          <Search size={16} color={COLORS.placeholder} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="운동 이름 검색"
            placeholderTextColor={COLORS.placeholder}
            className="flex-1 py-3 text-base text-white"
          />
        </View>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          className="h-12 w-12 items-center justify-center rounded-xl bg-primary active:opacity-80"
        >
          <Plus size={20} color={COLORS.white} />
        </Pressable>
      </View>

      {/* 부위 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3 max-h-10 px-5"
        contentContainerStyle={{ gap: 8 }}
      >
        <Pressable
          onPress={() => setFilterBodyPart(null)}
          className="rounded-full px-4 py-2"
          style={{
            backgroundColor:
              filterBodyPart === null ? COLORS.primary : "rgba(255,255,255,0.08)",
          }}
        >
          <Text
            className="text-sm font-medium"
            style={{
              color: filterBodyPart === null ? COLORS.white : "rgba(255,255,255,0.6)",
            }}
          >
            전체
          </Text>
        </Pressable>
        {BODY_PARTS.map((bp) => (
          <Pressable
            key={bp}
            onPress={() => setFilterBodyPart(bp === filterBodyPart ? null : bp)}
            className="rounded-full px-4 py-2"
            style={{
              backgroundColor:
                filterBodyPart === bp ? COLORS.primary : "rgba(255,255,255,0.08)",
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color:
                  filterBodyPart === bp ? COLORS.white : "rgba(255,255,255,0.6)",
              }}
            >
              {BODY_PART_LABEL[bp]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 운동 목록 */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text className="mt-3 text-sm text-white/50">불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-white/60">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-sm text-white/40">
                {search.trim()
                  ? "검색 결과가 없습니다"
                  : "등록된 운동이 없습니다"}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* 커스텀 종목 생성 모달 */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setShowCreateModal(false)}
        >
          <Pressable
            onPress={() => {}}
            className="mx-6 w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: COLORS.card }}
          >
            {/* 모달 헤더 */}
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">
                커스텀 종목 추가
              </Text>
              <Pressable
                onPress={() => setShowCreateModal(false)}
                className="rounded-lg p-1 active:bg-white/5"
              >
                <X size={20} color={COLORS.mutedForeground} />
              </Pressable>
            </View>

            {/* 종목 이름 */}
            <Text className="mb-2 text-sm font-medium text-white/60">
              종목 이름
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="예: 케이블 크로스오버"
              placeholderTextColor={COLORS.placeholder}
              className="mb-4 rounded-xl bg-white/5 px-4 py-3 text-base text-white"
            />

            {/* 운동 부위 */}
            <Text className="mb-2 text-sm font-medium text-white/60">
              운동 부위
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 max-h-10"
              contentContainerStyle={{ gap: 6 }}
            >
              {BODY_PARTS.map((bp) => (
                <Pressable
                  key={bp}
                  onPress={() => setNewBodyPart(bp)}
                  className="rounded-full px-3.5 py-2"
                  style={{
                    backgroundColor:
                      newBodyPart === bp ? COLORS.primary : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color:
                        newBodyPart === bp ? COLORS.white : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {BODY_PART_LABEL[bp]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 세부 타겟 (선택) */}
            <Text className="mb-2 text-sm font-medium text-white/60">
              세부 타겟 (선택)
            </Text>
            <TextInput
              value={newPartDetail}
              onChangeText={setNewPartDetail}
              placeholder="예: 상부, 중부, 하부"
              placeholderTextColor={COLORS.placeholder}
              className="mb-6 rounded-xl bg-white/5 px-4 py-3 text-base text-white"
            />

            {/* 생성 버튼 */}
            <Pressable
              onPress={handleCreateCustom}
              disabled={creating || !newName.trim()}
              className="items-center rounded-xl py-3.5 active:opacity-80"
              style={{
                backgroundColor: newName.trim()
                  ? COLORS.primary
                  : "rgba(255,255,255,0.05)",
              }}
            >
              {creating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: newName.trim() ? COLORS.white : "rgba(255,255,255,0.3)",
                  }}
                >
                  추가하기
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
