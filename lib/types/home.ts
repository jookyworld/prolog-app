import type { BodyPart } from "./exercise";

// 홈 화면 메인 통계
export interface HomeStatsResponse {
  // 주간/월간 기본 통계
  thisWeek: {
    workouts: number; // 이번 주 운동 횟수 (월~일 기준)
    goal: number; // 주간 목표
  };
  thisMonth: {
    workouts: number; // 이번 달 운동 횟수 (1일~오늘)
  };
  avgWorkoutDuration: number; // 이번 달 평균 운동 시간 (초)

  // 최근 7일 활동 (오늘 기준 과거 7일)
  weeklyActivity: DailyActivity[];

  // 주요 운동 성장 추세 (최대 3-5개)
  exerciseProgress: ExerciseProgress[];

  // 최근 운동 기록 (최대 3-5개)
  recentWorkouts: RecentWorkoutSummary[];
}

// 일별 활동
export interface DailyActivity {
  date: string; // "2024-02-25"
  dayOfWeek: string; // "화"
  formattedDate: string; // "2/25"
  workoutCount: number; // 해당 날짜 운동 횟수
  bodyParts: BodyPart[]; // 운동한 부위들 (중복 제거됨)
}

// 운동 성장 추세
export interface ExerciseProgress {
  exerciseId: number;
  exerciseName: string;
  bodyPart: BodyPart; // 운동 부위
  sessions: ExerciseSession[]; // 최근 2~5회 세션 (최소 2개)
}

export interface ExerciseSession {
  date: string; // "2/10" (간단한 형식)
  totalVolume: number; // 해당 운동의 총 볼륨 (kg)
  routineName: string; // 루틴명 또는 "자유 운동"
  sets: SetDetail[]; // 세트 상세
}

export interface SetDetail {
  weight: number; // kg
  reps: number; // 횟수
}

// 최근 운동 요약
export interface RecentWorkoutSummary {
  sessionId: number;
  title: string; // 루틴명 또는 "자유 운동"
  completedAt: string; // ISO 8601 형식
  exerciseCount: number; // 운동 종목 수
  totalSets: number; // 총 세트 수
  totalVolume: number; // 총 볼륨 (kg)
  duration: number; // 운동 시간 (초)
}
