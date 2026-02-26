import { communityApi } from "@/lib/api/community";
import { COLORS } from "@/lib/constants";
import type {
  SharedRoutineListItem,
  SharedRoutineSortType,
} from "@/lib/types/community";
import { BODY_PART_LABEL, type BodyPart } from "@/lib/types/exercise";
import {
  Clock,
  Download,
  Dumbbell,
  Eye,
  Heart,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "all" | "liked";

const SORT_LABELS: Record<SharedRoutineSortType, string> = {
  latest: "최신순",
  popular: "인기순",
  imported: "많이 가져간 순",
};

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function getBodyPartLabels(bodyParts: BodyPart[]): string[] {
  return [...new Set(bodyParts)].map((bp) => BODY_PART_LABEL[bp]);
}

interface RoutineCardProps {
  routine: SharedRoutineListItem;
  onImport: (id: number) => void;
  onPress: (id: number) => void;
}

function RoutineCard({ routine, onImport, onPress }: RoutineCardProps) {
  const bodyPartLabels = getBodyPartLabels(routine.bodyParts);

  return (
    <Pressable
      onPress={() => onPress(routine.id)}
      className="rounded-2xl bg-card p-4"
    >
      {/* 작성자 정보 */}
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Text className="text-sm font-bold text-primary">
            {routine.author.nickname[0]}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">
            {routine.author.nickname}
          </Text>
          <Text className="text-xs text-white/40">
            @{routine.author.username}
          </Text>
        </View>
      </View>

      {/* 루틴 제목 */}
      <Text className="mb-1.5 text-lg font-bold text-white">{routine.title}</Text>

      {/* 한줄평 */}
      <Text className="mb-2.5 text-sm text-white/60" numberOfLines={2}>
        {routine.content}
      </Text>

      {/* 운동 부위 뱃지 + 루틴 정보 (한 줄) */}
      <View className="mb-3 flex-row items-center gap-2">
        {/* 운동 부위 뱃지 */}
        {bodyPartLabels.slice(0, 3).map((label) => (
          <View
            key={label}
            className="rounded-full bg-primary/15 px-2.5 py-0.5"
          >
            <Text className="text-xs font-semibold text-primary">{label}</Text>
          </View>
        ))}
        {bodyPartLabels.length > 3 && (
          <View className="rounded-full bg-primary/15 px-2.5 py-0.5">
            <Text className="text-xs font-semibold text-primary">
              +{bodyPartLabels.length - 3}
            </Text>
          </View>
        )}

        {/* 구분자 */}
        <Text className="text-white/20">•</Text>

        {/* 루틴 정보 */}
        <View className="flex-row items-center gap-1">
          <Dumbbell size={12} color={COLORS.mutedForeground} />
          <Text className="text-xs text-white/50">
            {routine.exerciseCount}종목
          </Text>
        </View>

        {routine.estimatedDuration && (
          <>
            <Text className="text-white/20">•</Text>
            <View className="flex-row items-center gap-1">
              <Clock size={12} color={COLORS.mutedForeground} />
              <Text className="text-xs text-white/50">
                {routine.estimatedDuration}분
              </Text>
            </View>
          </>
        )}
      </View>

      {/* 통계 & 액션 */}
      <View className="flex-row items-center justify-between border-t border-white/5 pt-3">
        {/* 통계 */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Eye size={14} color={COLORS.mutedForeground} />
            <Text className="text-xs text-white/40">
              {formatNumber(routine.viewCount)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Heart
              size={14}
              color={routine.isLiked ? COLORS.primary : COLORS.mutedForeground}
              fill={routine.isLiked ? COLORS.primary : "transparent"}
            />
            <Text className="text-xs text-white/40">
              {formatNumber(routine.likeCount)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Download size={14} color={COLORS.mutedForeground} />
            <Text className="text-xs text-white/40">
              {formatNumber(routine.importCount)}
            </Text>
          </View>
        </View>

        {/* 액션 버튼 */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onImport(routine.id);
          }}
          className="rounded-lg bg-primary px-4 py-2 active:opacity-80"
        >
          <Text className="text-xs font-semibold text-white">가져오기</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortType, setSortType] = useState<SharedRoutineSortType>("latest");
  const [routines, setRoutines] = useState<SharedRoutineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoutines();
  }, [activeTab, sortType]);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        activeTab === "all"
          ? await communityApi.getSharedRoutines(sortType)
          : await communityApi.getLikedRoutines();

      setRoutines(response.items);
    } catch (err) {
      console.error("Failed to load routines:", err);
      setError("루틴을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoutines();
    setRefreshing(false);
  };

  const handleImport = async (id: number) => {
    try {
      const result = await communityApi.importRoutine(id);

      // 낙관적 업데이트
      setRoutines((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, importCount: r.importCount + 1 } : r,
        ),
      );

      // TODO: 성공 토스트 표시
      console.log("루틴이 추가되었습니다:", result.routineId);
    } catch (err) {
      console.error("Failed to import routine:", err);
    }
  };

  const handlePress = (id: number) => {
    // TODO: 상세 화면 구현 예정
    console.log("Routine clicked:", id);
  };

  // 로딩 상태
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 헤더 */}
        <View className="px-5 py-4">
          <Text className="text-2xl font-bold text-white">커뮤니티</Text>
          <Text className="mt-1 text-sm text-white/50">
            다른 사람들의 루틴을 확인하고 가져가보세요
          </Text>
        </View>

        {/* 탭 */}
        <View className="mb-4 flex-row gap-2 px-5">
          <Pressable
            onPress={() => setActiveTab("all")}
            className={`flex-1 rounded-lg py-3 ${
              activeTab === "all" ? "bg-primary" : "bg-card"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                activeTab === "all" ? "text-white" : "text-white/50"
              }`}
            >
              전체
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("liked")}
            className={`flex-1 rounded-lg py-3 ${
              activeTab === "liked" ? "bg-primary" : "bg-card"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                activeTab === "liked" ? "text-white" : "text-white/50"
              }`}
            >
              좋아요한 루틴
            </Text>
          </Pressable>
        </View>

        {/* 정렬 (전체 탭에만 표시) */}
        {activeTab === "all" && (
          <View className="mb-4 flex-row gap-2 px-5">
            {(Object.keys(SORT_LABELS) as SharedRoutineSortType[]).map(
              (sort) => (
                <Pressable
                  key={sort}
                  onPress={() => setSortType(sort)}
                  className={`rounded-full px-4 py-2 ${
                    sortType === sort ? "bg-primary/20" : "bg-card"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      sortType === sort ? "text-primary" : "text-white/50"
                    }`}
                  >
                    {SORT_LABELS[sort]}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
        )}

        {/* 에러 상태 */}
        {error && (
          <View className="items-center px-5 py-10">
            <Text className="text-center text-white/60">{error}</Text>
            <Pressable
              onPress={loadRoutines}
              className="mt-4 rounded-lg bg-primary px-6 py-3"
            >
              <Text className="font-semibold text-white">다시 시도</Text>
            </Pressable>
          </View>
        )}

        {/* 루틴 리스트 */}
        {!error && (
          <View className="gap-3 px-5 pb-6">
            {routines.length === 0 ? (
              <View className="items-center py-20">
                <Text className="text-center text-white/40">
                  {activeTab === "all"
                    ? "아직 공유된 루틴이 없습니다"
                    : "좋아요한 루틴이 없습니다"}
                </Text>
              </View>
            ) : (
              routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onImport={handleImport}
                  onPress={handlePress}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
