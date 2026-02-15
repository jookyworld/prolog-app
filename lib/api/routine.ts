import { apiFetch } from "../api";
import type { RoutineDetail, RoutineListItem } from "../types/routine";

export const routineApi = {
  getRoutines(): Promise<RoutineListItem[]> {
    return apiFetch("/api/routines");
  },

  getRoutineDetail(id: number): Promise<RoutineDetail> {
    return apiFetch(`/api/routines/${id}`);
  },

  deleteRoutine(id: number): Promise<void> {
    return apiFetch(`/api/routines/${id}`, { method: "DELETE" });
  },
};
