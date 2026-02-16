import type { ExerciseResponse } from "../types/exercise";

let selectedExercises: ExerciseResponse[] = [];

export function setSelectedExercises(exercises: ExerciseResponse[]) {
  selectedExercises = exercises;
}

export function getSelectedExercises(): ExerciseResponse[] {
  const result = selectedExercises;
  selectedExercises = [];
  return result;
}
