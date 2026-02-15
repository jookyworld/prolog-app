// --- Backend API Response Types ---

export interface WorkoutSessionListItemRes {
  sessionId: number;
  routineId: number | null;
  routineTitle: string | null;
  startedAt: string | null;
  completedAt: string;
}

export interface PageWorkoutSessionListItemRes {
  content: WorkoutSessionListItemRes[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface WorkoutSetRes {
  setId: number;
  setNumber: number;
  weight: number;
  reps: number;
}

export interface WorkoutExerciseRes {
  exerciseId: number;
  exerciseName: string;
  sets: WorkoutSetRes[];
}

export interface WorkoutSessionDetailRes {
  sessionId: number;
  routineId: number | null;
  routineTitle: string | null;
  startedAt: string | null;
  completedAt: string;
  exercises: WorkoutExerciseRes[];
}

// --- App-level types ---

export interface WorkoutSession {
  id: string;
  title: string;
  type: "routine" | "free";
  completedAt: string;
}

export interface WorkoutSet {
  id: string;
  setNo: number;
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  orderNo: number;
  sets: WorkoutSet[];
}

export interface WorkoutSessionDetail {
  id: string;
  title: string;
  type: "routine" | "free";
  completedAt: string;
  startedAt: string | null;
  elapsedTime: number;
  totalSets: number;
  totalVolume: number;
  exercises: WorkoutExercise[];
}

// --- Conversion ---

export function toWorkoutSession(
  res: WorkoutSessionListItemRes,
): WorkoutSession {
  return {
    id: String(res.sessionId),
    title: res.routineTitle ?? "자유 운동",
    type: res.routineId ? "routine" : "free",
    completedAt: res.completedAt,
  };
}

export function toWorkoutSessionDetail(
  res: WorkoutSessionDetailRes,
): WorkoutSessionDetail {
  const exercises: WorkoutExercise[] = res.exercises.map((ex, idx) => ({
    id: String(ex.exerciseId),
    orderNo: idx + 1,
    name: ex.exerciseName,
    sets: ex.sets.map((s) => ({
      id: String(s.setId),
      setNo: s.setNumber,
      weight: s.weight,
      reps: s.reps,
    })),
  }));

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = exercises.reduce(
    (sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  let elapsedTime = 0;
  if (res.startedAt && res.completedAt) {
    elapsedTime = Math.floor(
      (new Date(res.completedAt).getTime() -
        new Date(res.startedAt).getTime()) /
        1000,
    );
  }

  return {
    id: String(res.sessionId),
    title: res.routineTitle ?? "자유 운동",
    type: res.routineId ? "routine" : "free",
    completedAt: res.completedAt,
    startedAt: res.startedAt,
    elapsedTime,
    totalSets,
    totalVolume,
    exercises,
  };
}
