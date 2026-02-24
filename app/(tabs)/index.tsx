import { COLORS } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import { ChevronRight, TrendingUp } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Polyline, Circle, Text as SvgText } from "react-native-svg";
import { useState } from "react";

// 목 데이터
const MOCK_STATS = {
  thisWeekWorkouts: 3,
  weeklyGoal: 5,
  thisMonthWorkouts: 12,
  avgWorkoutDuration: 5400, // 초 (1시간 30분)
};

// 오늘 기준 최근 7일 (오늘이 월요일이라고 가정)
const MOCK_WEEKLY_TREND = [
  { day: "화", date: "2/18", workouts: 1 },
  { day: "수", date: "2/19", workouts: 0 },
  { day: "목", date: "2/20", workouts: 1 },
  { day: "금", date: "2/21", workouts: 1 },
  { day: "토", date: "2/22", workouts: 0 },
  { day: "일", date: "2/23", workouts: 0 },
  { day: "월", date: "2/24", workouts: 0 },
];

// 종목별 성장 추세 (주요 운동 기준)
const MOCK_EXERCISE_PROGRESS = [
  {
    exerciseId: 1,
    exerciseName: "스쿼트",
    sessions: [
      {
        date: "2/10",
        totalVolume: 1200,
        routineName: "하체 데이",
        sets: [
          { weight: 80, reps: 5 },
          { weight: 80, reps: 5 },
          { weight: 80, reps: 5 },
        ],
      },
      {
        date: "2/13",
        totalVolume: 1350,
        routineName: "하체 데이",
        sets: [
          { weight: 90, reps: 5 },
          { weight: 90, reps: 5 },
          { weight: 90, reps: 5 },
        ],
      },
      {
        date: "2/17",
        totalVolume: 1425,
        routineName: "하체 데이",
        sets: [
          { weight: 95, reps: 5 },
          { weight: 95, reps: 5 },
          { weight: 95, reps: 5 },
        ],
      },
      {
        date: "2/20",
        totalVolume: 1500,
        routineName: "하체 데이",
        sets: [
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
        ],
      },
      {
        date: "2/24",
        totalVolume: 1575,
        routineName: "하체 데이",
        sets: [
          { weight: 105, reps: 5 },
          { weight: 105, reps: 5 },
          { weight: 105, reps: 5 },
        ],
      },
    ],
  },
  {
    exerciseId: 2,
    exerciseName: "벤치프레스",
    sessions: [
      {
        date: "2/11",
        totalVolume: 900,
        routineName: "가슴 + 삼두",
        sets: [
          { weight: 60, reps: 5 },
          { weight: 60, reps: 5 },
          { weight: 60, reps: 5 },
        ],
      },
      {
        date: "2/14",
        totalVolume: 975,
        routineName: "가슴 + 삼두",
        sets: [
          { weight: 65, reps: 5 },
          { weight: 65, reps: 5 },
          { weight: 65, reps: 5 },
        ],
      },
      {
        date: "2/18",
        totalVolume: 1050,
        routineName: "가슴 + 삼두",
        sets: [
          { weight: 70, reps: 5 },
          { weight: 70, reps: 5 },
          { weight: 70, reps: 5 },
        ],
      },
      {
        date: "2/21",
        totalVolume: 1050,
        routineName: "가슴 + 삼두",
        sets: [
          { weight: 70, reps: 5 },
          { weight: 70, reps: 5 },
          { weight: 70, reps: 5 },
        ],
      },
      {
        date: "2/24",
        totalVolume: 1125,
        routineName: "가슴 + 삼두",
        sets: [
          { weight: 75, reps: 5 },
          { weight: 75, reps: 5 },
          { weight: 75, reps: 5 },
        ],
      },
    ],
  },
  {
    exerciseId: 3,
    exerciseName: "데드리프트",
    sessions: [
      {
        date: "2/12",
        totalVolume: 1500,
        routineName: "등 + 이두",
        sets: [
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
        ],
      },
      {
        date: "2/16",
        totalVolume: 1650,
        routineName: "등 + 이두",
        sets: [
          { weight: 110, reps: 5 },
          { weight: 110, reps: 5 },
          { weight: 110, reps: 5 },
        ],
      },
      {
        date: "2/20",
        totalVolume: 1800,
        routineName: "등 + 이두",
        sets: [
          { weight: 120, reps: 5 },
          { weight: 120, reps: 5 },
          { weight: 120, reps: 5 },
        ],
      },
      {
        date: "2/23",
        totalVolume: 1950,
        routineName: "등 + 이두",
        sets: [
          { weight: 130, reps: 5 },
          { weight: 130, reps: 5 },
          { weight: 130, reps: 5 },
        ],
      },
    ],
  },
];

const MOCK_RECENT_WORKOUTS = [
  {
    id: 1,
    title: "가슴 + 삼두",
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    exerciseCount: 5,
    totalSets: 15,
    totalVolume: 2500,
    duration: 5400,
  },
  {
    id: 2,
    title: "등 + 이두",
    completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    exerciseCount: 4,
    totalSets: 12,
    totalVolume: 2100,
    duration: 4800,
  },
  {
    id: 3,
    title: "하체 데이",
    completedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    exerciseCount: 6,
    totalSets: 18,
    totalVolume: 3800,
    duration: 6000,
  },
];

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

export default function HomeScreen() {
  const router = useRouter();
  const [selectedSessions, setSelectedSessions] = useState<
    Record<number, number | null>
  >({});

  const toggleSession = (exerciseId: number, sessionIndex: number) => {
    setSelectedSessions((prev) => ({
      ...prev,
      [exerciseId]:
        prev[exerciseId] === sessionIndex ? null : sessionIndex,
    }));
  };

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
              {MOCK_STATS.thisWeekWorkouts}
              <Text className="text-base text-white/40">
                /{MOCK_STATS.weeklyGoal}
              </Text>
            </Text>
          </View>

          {/* 이번 달 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">이번 달</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {MOCK_STATS.thisMonthWorkouts}
              <Text className="text-base text-white/40">회</Text>
            </Text>
          </View>

          {/* 평균 운동 시간 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">평균 시간</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {Math.floor(MOCK_STATS.avgWorkoutDuration / 3600)}
              <Text className="text-base text-white/40">h </Text>
              {Math.floor((MOCK_STATS.avgWorkoutDuration % 3600) / 60)}
              <Text className="text-base text-white/40">m</Text>
            </Text>
          </View>
        </View>

        {/* 주간 활동 */}
        <View className="mx-5 mt-6 rounded-2xl bg-card p-5">
          <Text className="mb-4 text-sm font-medium text-white/60">
            최근 7일
          </Text>
          <View className="flex-row items-end justify-between gap-1.5">
            {MOCK_WEEKLY_TREND.map((day, idx) => {
              const hasWorkout = day.workouts > 0;
              return (
                <View key={idx} className="flex-1 items-center gap-2">
                  <View
                    className={`w-full rounded-lg ${
                      hasWorkout ? "bg-primary" : "bg-white/5"
                    }`}
                    style={{ height: hasWorkout ? 40 : 8 }}
                  />
                  <View className="items-center">
                    <Text
                      className={`text-xs ${
                        hasWorkout ? "text-white/80" : "text-white/30"
                      }`}
                    >
                      {day.day}
                    </Text>
                    <Text className="text-[10px] text-white/20">
                      {day.date}
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
            {MOCK_EXERCISE_PROGRESS.filter(
              (exercise) => exercise.sessions.length >= 2,
            ).map((exercise) => {
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
                  className="overflow-hidden rounded-2xl bg-card"
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
                    <View style={{ height: 90, marginTop: 12, marginHorizontal: -8 }}>
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
                                  ? 15 +
                                    (1 - (session.totalVolume - minVolume) / range) *
                                      50
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
                              ? 15 +
                                (1 - (session.totalVolume - minVolume) / range) * 50
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
                    </View>
                  </View>

                  {/* 선택된 세션 상세 정보 */}
                  {selectedSession && (
                    <View className="border-t border-white/10 bg-black/20 px-4 py-3">
                      <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-white">
                          {selectedSession.routineName}
                        </Text>
                        <Text className="text-xs text-primary">
                          {selectedSession.date}
                        </Text>
                      </View>
                      <View className="gap-1.5">
                        {selectedSession.sets.map((set, idx) => (
                          <View
                            key={idx}
                            className="flex-row items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                          >
                            <Text className="text-xs font-medium text-white/50">
                              {idx + 1}
                            </Text>
                            <View className="flex-row gap-6">
                              <Text className="text-sm font-medium text-white">
                                {set.weight}kg
                              </Text>
                              <Text className="text-sm font-medium text-white">
                                ×{set.reps}
                              </Text>
                              <Text className="w-12 text-right text-xs text-white/40">
                                {set.weight * set.reps}kg
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                      <View className="mt-3 flex-row items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5">
                        <Text className="text-xs font-semibold text-white/80">
                          총 볼륨
                        </Text>
                        <Text className="text-base font-bold text-primary">
                          {formatVolume(selectedSession.totalVolume)}
                        </Text>
                      </View>
                    </View>
                  )}
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
            {MOCK_RECENT_WORKOUTS.map((workout) => (
              <Pressable
                key={workout.id}
                onPress={() =>
                  router.push(`/(tabs)/profile/history/${workout.id}`)
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
