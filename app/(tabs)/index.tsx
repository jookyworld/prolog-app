import { COLORS } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import { BODY_PART_LABEL, type BodyPart } from "@/lib/types/exercise";
import { ChevronRight, X } from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Polyline, Circle, Text as SvgText } from "react-native-svg";
import { useState, useEffect } from "react";
import { homeApi } from "@/lib/api/home";
import type { HomeStatsResponse } from "@/lib/types/home";


function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}톤`;
  }
  return `${kg}kg`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

function getBodyPartLabel(bodyParts: BodyPart[]): string {
  if (bodyParts.length === 0) return "";
  if (bodyParts.length === 1) return BODY_PART_LABEL[bodyParts[0]];

  const unique = [...new Set(bodyParts)];
  if (unique.length === 1) return BODY_PART_LABEL[unique[0]];

  const hasLower = unique.some((bp) => bp === "LOWER_BODY");
  const hasUpper = unique.some(
    (bp) =>
      bp === "CHEST" || bp === "BACK" || bp === "SHOULDER" || bp === "ARM"
  );

  if (hasLower && hasUpper) return "전신";
  if (hasLower) return "하체";
  if (hasUpper && unique.length > 2) return "상체";

  return unique
    .slice(0, 2)
    .map((bp) => BODY_PART_LABEL[bp])
    .join("·");
}

export default function HomeScreen() {
  const router = useRouter();
  const [selectedSessions, setSelectedSessions] = useState<
    Record<number, number | null>
  >({});
  const [homeData, setHomeData] = useState<HomeStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeStats();
  }, []);

  const loadHomeStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await homeApi.getHomeStats();
      setHomeData(data);
    } catch (err) {
      console.error("Failed to load home stats:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (exerciseId: number, sessionIndex: number) => {
    setSelectedSessions((prev) => ({
      ...prev,
      [exerciseId]:
        prev[exerciseId] === sessionIndex ? null : sessionIndex,
    }));
  };

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error || !homeData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-white/60">
            {error || "데이터를 불러올 수 없습니다."}
          </Text>
          <Pressable
            onPress={loadHomeStats}
            className="mt-4 rounded-lg bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-white">다시 시도</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* 헤더 */}
        <View className="px-5 py-4">
          <Text className="text-2xl font-bold text-white">홈</Text>
          <Text className="mt-1 text-sm text-white/50">
            {new Date().toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </Text>
        </View>

        {/* 통계 카드 (3개) */}
        <View className="flex-row gap-3 px-5">
          {/* 이번 주 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">이번 주</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {homeData.thisWeek.workouts}
              <Text className="text-base text-white/40">
                /{homeData.thisWeek.goal}
              </Text>
            </Text>
          </View>

          {/* 이번 달 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">이번 달</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {homeData.thisMonth.workouts}
              <Text className="text-base text-white/40">회</Text>
            </Text>
          </View>

          {/* 평균 운동 시간 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">평균 시간</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {Math.floor(homeData.avgWorkoutDuration / 3600)}
              <Text className="text-base text-white/40">h </Text>
              {Math.floor((homeData.avgWorkoutDuration % 3600) / 60)}
              <Text className="text-base text-white/40">m</Text>
            </Text>
          </View>
        </View>

        {/* 주간 활동 */}
        <View className="mx-5 mt-6 rounded-2xl bg-card p-5">
          <Text className="mb-4 text-sm font-medium text-white/60">
            최근 7일
          </Text>
          <View className="flex-row items-center justify-between gap-1.5">
            {homeData.weeklyActivity.map((day, idx) => {
              const hasWorkout = day.workoutCount > 0;
              const bodyPartLabel = getBodyPartLabel(day.bodyParts);
              return (
                <View key={idx} className="flex-1 items-center gap-2">
                  {/* 부위 표시 */}
                  {hasWorkout && bodyPartLabel ? (
                    <View className="w-full items-center rounded-lg bg-primary/15 py-2">
                      <Text className="text-[10px] font-bold text-primary">
                        {bodyPartLabel}
                      </Text>
                    </View>
                  ) : (
                    <View className="w-full items-center py-2">
                      <View className="h-2 w-2 rounded-full bg-white/5" />
                    </View>
                  )}

                  {/* 날짜 */}
                  <View className="items-center">
                    <Text
                      className={`text-xs ${
                        hasWorkout ? "text-white/80" : "text-white/30"
                      }`}
                    >
                      {day.dayOfWeek}
                    </Text>
                    <Text className="text-[10px] text-white/20">
                      {day.formattedDate}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 종목별 성장 추세 */}
        <View className="mx-5 mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-white">
              주요 운동 성장 추세
            </Text>
          </View>

          <View className="gap-3">
            {homeData.exerciseProgress
              .filter((exercise) => exercise.sessions.length >= 2)
              .map((exercise) => {
              const firstVolume = exercise.sessions[0].totalVolume;
              const lastVolume =
                exercise.sessions[exercise.sessions.length - 1].totalVolume;
              const growth = lastVolume - firstVolume;
              const growthPercent = ((growth / firstVolume) * 100).toFixed(1);
              const maxVolume = Math.max(
                ...exercise.sessions.map((s) => s.totalVolume),
              );
              const minVolume = Math.min(
                ...exercise.sessions.map((s) => s.totalVolume),
              );
              const range = maxVolume - minVolume;

              const selectedSessionIndex =
                selectedSessions[exercise.exerciseId];
              const selectedSession =
                selectedSessionIndex !== null &&
                selectedSessionIndex !== undefined
                  ? exercise.sessions[selectedSessionIndex]
                  : null;

              return (
                <View
                  key={exercise.exerciseId}
                  className="overflow-visible rounded-2xl bg-card"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <View className="px-4 pt-4 pb-2">
                    <View className="mb-2 flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-white">
                          {exercise.exerciseName}
                        </Text>
                        <Text className="mt-0.5 text-xs text-white/40">
                          {formatVolume(firstVolume)} → {formatVolume(lastVolume)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xl font-bold text-primary">
                          +{formatVolume(growth)}
                        </Text>
                        <Text className="text-xs text-white/40">
                          +{growthPercent}%
                        </Text>
                      </View>
                    </View>

                    {/* 꺾은선 그래프 */}
                    <View style={{ position: "relative", height: 90, marginTop: 12, marginHorizontal: -8 }}>
                      <Svg width="100%" height="90" viewBox="0 0 300 90">
                        {/* 배경 그리드 (은은하게) */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <SvgText
                            key={`grid-${i}`}
                            x="5"
                            y={15 + i * 12}
                            fontSize="8"
                            fill="rgba(255,255,255,0.1)"
                          >
                            ─
                          </SvgText>
                        ))}

                        {/* 라인 그리기 */}
                        <Polyline
                          points={exercise.sessions
                            .map((session, i) => {
                              const x =
                                (i / Math.max(exercise.sessions.length - 1, 1)) *
                                  280 +
                                10;
                              const y =
                                range > 0
                                  ? 10 +
                                    (1 - (session.totalVolume - minVolume) / range) *
                                      40
                                  : 40;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke={COLORS.primary}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* 점 그리기 */}
                        {exercise.sessions.map((session, i) => {
                          const x =
                            (i / Math.max(exercise.sessions.length - 1, 1)) * 280 +
                            10;
                          const y =
                            range > 0
                              ? 10 +
                                (1 - (session.totalVolume - minVolume) / range) * 40
                              : 40;
                          const isLast = i === exercise.sessions.length - 1;
                          const isSelected = selectedSessionIndex === i;
                          return (
                            <Circle
                              key={i}
                              cx={x}
                              cy={y}
                              r={isSelected ? 8 : isLast ? 6 : 4}
                              fill={
                                isSelected || isLast
                                  ? COLORS.primary
                                  : COLORS.card
                              }
                              stroke={COLORS.primary}
                              strokeWidth={isSelected ? 3 : isLast ? 2.5 : 2}
                              onPress={() => toggleSession(exercise.exerciseId, i)}
                            />
                          );
                        })}

                        {/* 날짜 표시 */}
                        {exercise.sessions.map((session, i) => {
                          const x =
                            (i / Math.max(exercise.sessions.length - 1, 1)) * 280 +
                            10;
                          const isSelected = selectedSessionIndex === i;
                          return (
                            <SvgText
                              key={`date-${i}`}
                              x={x}
                              y="80"
                              fontSize="11"
                              fill={
                                isSelected
                                  ? COLORS.primary
                                  : "rgba(255,255,255,0.4)"
                              }
                              fontWeight={isSelected ? "bold" : "normal"}
                              textAnchor="middle"
                              onPress={() => toggleSession(exercise.exerciseId, i)}
                            >
                              {session.date}
                            </SvgText>
                          );
                        })}
                      </Svg>

                      {/* Floating card for selected session */}
                      {selectedSession && (
                        <View
                          style={{
                            position: "absolute",
                            top: 0,
                            left: "15%",
                            right: "15%",
                            zIndex: 1000,
                            elevation: 20,
                          }}
                          className="rounded-xl bg-card/95 backdrop-blur-sm"
                        >
                          <View
                            style={{
                              borderWidth: 1,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                            className="rounded-xl p-3"
                          >
                            {/* Header */}
                            <View className="mb-2 flex-row items-start justify-between">
                              <View className="flex-1">
                                <Text className="text-sm font-semibold text-white">
                                  {selectedSession.routineName}
                                </Text>
                                <Text className="text-xs text-white/50">
                                  {selectedSession.date}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() =>
                                  toggleSession(exercise.exerciseId, -1)
                                }
                                className="ml-2"
                              >
                                <X size={16} color="rgba(255,255,255,0.5)" />
                              </TouchableOpacity>
                            </View>

                            {/* Sets table */}
                            <View className="mb-2 gap-1">
                              {selectedSession.sets.map((set, idx) => (
                                <View
                                  key={idx}
                                  className="flex-row items-center justify-between"
                                >
                                  <Text className="w-6 text-xs text-white/40">
                                    {idx + 1}
                                  </Text>
                                  <Text className="w-16 text-sm font-medium text-white">
                                    {set.weight}kg
                                  </Text>
                                  <Text className="w-12 text-sm font-medium text-white">
                                    ×{set.reps}
                                  </Text>
                                  <Text className="w-16 text-right text-xs text-white/40">
                                    {set.weight * set.reps}kg
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* Total volume */}
                            <View className="flex-row items-center justify-between rounded-lg bg-primary/10 px-2 py-1.5">
                              <Text className="text-xs font-semibold text-white/70">
                                총 볼륨
                              </Text>
                              <Text className="text-sm font-bold text-primary">
                                {formatVolume(selectedSession.totalVolume)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 최근 운동 기록 */}
        <View className="mx-5 mb-6 mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-white">
              최근 운동
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/profile/history")}
              className="flex-row items-center gap-1"
            >
              <Text className="text-sm text-white/40">전체보기</Text>
              <ChevronRight size={16} color={COLORS.mutedForeground} />
            </Pressable>
          </View>

          <View className="gap-3">
            {homeData.recentWorkouts.map((workout) => (
              <Pressable
                key={workout.sessionId}
                onPress={() =>
                  router.push(`/(tabs)/profile/history/${workout.sessionId}`)
                }
                className="rounded-2xl bg-card p-4 active:opacity-80"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-base font-medium text-white">
                    {workout.title}
                  </Text>
                  <Text className="text-xs text-white/40">
                    {formatRelativeDate(workout.completedAt)}
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <Text className="text-xs text-white/50">
                    {workout.exerciseCount}종목
                  </Text>
                  <Text className="text-xs text-white/50">
                    {workout.totalSets}세트
                  </Text>
                  <Text className="text-xs text-white/50">
                    {formatVolume(workout.totalVolume)}
                  </Text>
                  <Text className="text-xs text-white/50">
                    {formatDuration(workout.duration)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
