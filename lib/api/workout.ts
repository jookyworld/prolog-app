import { apiFetch } from "../api";
import type {
  PageWorkoutSessionListItemRes,
  WorkoutSessionDetailRes,
} from "../types/workout";

export const workoutApi = {
  getSessions(): Promise<PageWorkoutSessionListItemRes> {
    return apiFetch("/api/workouts/sessions?page=0&size=100");
  },

  getSessionDetail(id: string): Promise<WorkoutSessionDetailRes> {
    return apiFetch(`/api/workouts/sessions/${id}`);
  },
};
