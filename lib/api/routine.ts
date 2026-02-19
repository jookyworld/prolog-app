import { apiFetch } from "../api";
import type {
  RoutineCreateRequest,
  RoutineDetail,
  RoutineListItem,
} from "../types/routine";

export const routineApi = {
  getRoutines(status?: "ACTIVE" | "ARCHIVED" | "ALL"): Promise<RoutineListItem[]> {
    const params = status ? `?status=${status}` : "";
    return apiFetch(`/api/routines${params}`);
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

  updateRoutine(id: number, req: RoutineCreateRequest): Promise<RoutineDetail> {
    return apiFetch(`/api/routines/${id}`, {
      method: "PUT",
      body: JSON.stringify(req),
    });
  },

  deleteRoutine(id: number): Promise<void> {
    return apiFetch(`/api/routines/${id}`, { method: "DELETE" });
  },

  archiveRoutine(id: number): Promise<void> {
    return apiFetch(`/api/routines/${id}/archive`, { method: "PATCH" });
  },

  activateRoutine(id: number): Promise<void> {
    return apiFetch(`/api/routines/${id}/activate`, { method: "PATCH" });
  },
};
