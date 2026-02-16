import { apiFetch } from "../api";
import type {
  RoutineCreateRequest,
  RoutineDetail,
  RoutineListItem,
} from "../types/routine";

export const routineApi = {
  getRoutines(): Promise<RoutineListItem[]> {
    return apiFetch("/api/routines");
  },

  getRoutineDetail(id: number): Promise<RoutineDetail> {
    return apiFetch(`/api/routines/${id}`);
  },

  createRoutine(req: RoutineCreateRequest): Promise<RoutineDetail> {
    return apiFetch("/api/routines", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  deleteRoutine(id: number): Promise<void> {
    return apiFetch(`/api/routines/${id}`, { method: "DELETE" });
  },
};
