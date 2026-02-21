import { apiFetch } from "../api";
import type {
  PageWorkoutSessionListItemRes,
  WorkoutSessionCompleteReq,
  WorkoutSessionDetailRes,
  WorkoutSessionStartRes,
} from "../types/workout";

export const workoutApi = {
  getSessions(): Promise<PageWorkoutSessionListItemRes> {
    return apiFetch("/api/workouts/sessions?page=0&size=100");
  },

  getSessionDetail(id: string): Promise<WorkoutSessionDetailRes> {
    return apiFetch(`/api/workouts/sessions/${id}`);
  },

  startSession(routineId?: number | null): Promise<WorkoutSessionStartRes> {
    return apiFetch("/api/workouts/sessions", {
      method: "POST",
      body: JSON.stringify({ routineId: routineId ?? null }),
    });
  },

  deleteSession(sessionId: number): Promise<void> {
    return apiFetch(`/api/workouts/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  completeSession(
    sessionId: number,
    body: WorkoutSessionCompleteReq,
  ): Promise<void> {
    return apiFetch(`/api/workouts/sessions/${sessionId}/complete`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  cancelSession(sessionId: number): Promise<void> {
    return apiFetch(`/api/workouts/sessions/${sessionId}/cancel`, {
      method: "DELETE",
    });
  },
};
