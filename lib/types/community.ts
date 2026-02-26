import type { BodyPart } from "./exercise";

// 루틴 스냅샷 구조
export interface RoutineSnapshot {
  routineId: number;
  title: string;
  description: string;
  exercises: ExerciseSnapshot[];
}

export interface ExerciseSnapshot {
  exerciseId: number;
  exerciseName: string;
  bodyPart: BodyPart;
  order: number;
  targetSets?: number;
  targetReps?: number;
}

// 세션 스냅샷 구조
export interface SessionSnapshot {
  sessionId: number;
  completedAt: string;
  duration: number; // 초
  totalVolume: number;
  totalSets: number;
  exercises: SessionExerciseSnapshot[];
}

export interface SessionExerciseSnapshot {
  exerciseId: number;
  exerciseName: string;
  sets: SetSnapshot[];
  totalVolume: number;
}

export interface SetSnapshot {
  weight: number;
  reps: number;
}

// 공유 루틴 리스트 아이템
export interface SharedRoutineListItem {
  id: number;
  title: string;
  content: string; // 한줄평

  // 루틴 정보 (snapshot에서 추출)
  exerciseCount: number;
  estimatedDuration?: number; // 예상 시간 (분)
  bodyParts: BodyPart[]; // 운동 부위들

  // 통계
  viewCount: number;
  importCount: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean; // 현재 사용자가 좋아요 했는지

  // 작성자 정보
  author: {
    id: number;
    username: string;
    nickname: string;
    profileImage?: string;
  };

  createdAt: string;
}

// 공유 루틴 상세
export interface SharedRoutineDetail extends SharedRoutineListItem {
  routineSnapshot: RoutineSnapshot;
  lastSessionSnapshot?: SessionSnapshot;
}

// 댓글
export interface Comment {
  id: number;
  content: string;
  createdAt: string;

  author: {
    id: number;
    username: string;
    nickname: string;
    profileImage?: string;
  };
}

// API 요청/응답 타입
export interface SharedRoutinesResponse {
  items: SharedRoutineListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export interface CommentsResponse {
  items: Comment[];
  total: number;
}

export interface CreateSharedRoutineRequest {
  routineId: number;
  title: string;
  content: string;
}

export interface CreateCommentRequest {
  content: string;
}

export type SharedRoutineSortType = "latest" | "popular" | "imported";
