import { apiFetch } from "../api";
import type { HomeStatsResponse } from "../types/home";

export const homeApi = {
  /**
   * 홈 화면 통계 데이터 가져오기
   */
  getHomeStats: async (): Promise<HomeStatsResponse> => {
    return apiFetch<HomeStatsResponse>("/api/stats/home");
  },
};
