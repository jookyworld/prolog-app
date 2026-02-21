import { apiFetch } from "../api";
import type { BodyPart, ExerciseResponse } from "../types/exercise";

export const exerciseApi = {
  getExercises(): Promise<ExerciseResponse[]> {
    return apiFetch("/api/exercises");
  },

  createCustomExercise(body: {
    name: string;
    bodyPart: BodyPart;
    partDetail?: string;
  }): Promise<ExerciseResponse> {
    return apiFetch("/api/exercises/custom", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
