import { exerciseApi } from "@/lib/api/exercise";
import { COLORS } from "@/lib/constants";
import { setSelectedExercises } from "@/lib/store/exercise-selection";
import type { BodyPart, ExerciseResponse } from "@/lib/types/exercise";
import { BODY_PARTS, BODY_PART_LABEL } from "@/lib/types/exercise";
import { ArrowLeft, Check, Search } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SelectExercisesScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filterBodyPart, setFilterBodyPart] = useState<BodyPart | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

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
    router.back();
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
            <Text className="text-base text-white">{item.name}</Text>
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

      {/* 검색 */}
      <View className="mx-5 mb-3 flex-row items-center gap-2 rounded-xl bg-white/5 px-4">
        <Search size={16} color={COLORS.placeholder} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="운동 이름 검색"
          placeholderTextColor={COLORS.placeholder}
          className="flex-1 py-3 text-base text-white"
        />
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
    </SafeAreaView>
  );
}
