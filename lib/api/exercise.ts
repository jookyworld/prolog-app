import { apiFetch } from "../api";
import type { ExerciseResponse } from "../types/exercise";

export const exerciseApi = {
  getExercises(): Promise<ExerciseResponse[]> {
    return apiFetch("/api/exercises");
  },
};
