import type {
  SharedRoutinesResponse,
  SharedRoutineDetail,
  CreateSharedRoutineRequest,
  SharedRoutineSortType,
} from "../types/community";

// TODO: 백엔드 API 개발 후 실제 API 호출로 변경
// 현재는 Mock 데이터로 작동

const MOCK_SHARED_ROUTINES: SharedRoutinesResponse = {
  items: [
    {
      id: 1,
      title: "PPL 루틴 - Push Day",
      content: "가슴, 어깨, 삼두 집중 루틴입니다. 초보자도 가능!",
      exerciseCount: 6,
      estimatedDuration: 60,
      bodyParts: ["CHEST", "SHOULDER", "ARM"],
      viewCount: 234,
      importCount: 45,
      likeCount: 89,
      isLiked: false,
      author: {
        id: 1,
        username: "fitness_king",
        nickname: "헬스왕",
        profileImage: undefined,
      },
      createdAt: "2024-02-25T10:30:00Z",
    },
    {
      id: 2,
      title: "하체 집중 루틴",
      content: "스쿼트 중심의 하체 강화 프로그램",
      exerciseCount: 5,
      estimatedDuration: 50,
      bodyParts: ["LOWER_BODY"],
      viewCount: 156,
      importCount: 32,
      likeCount: 67,
      isLiked: true,
      author: {
        id: 2,
        username: "leg_day_lover",
        nickname: "하체러버",
        profileImage: undefined,
      },
      createdAt: "2024-02-24T15:20:00Z",
    },
    {
      id: 3,
      title: "등 운동 루틴",
      content: "데드리프트와 풀업 중심 등 운동",
      exerciseCount: 4,
      estimatedDuration: 45,
      bodyParts: ["BACK"],
      viewCount: 189,
      importCount: 28,
      likeCount: 54,
      isLiked: false,
      author: {
        id: 3,
        username: "back_master",
        nickname: "등근육",
        profileImage: undefined,
      },
      createdAt: "2024-02-23T09:15:00Z",
    },
  ],
  total: 3,
  page: 1,
  pageSize: 20,
  hasNext: false,
};

export const communityApi = {
  // 공유 루틴 목록 조회
  getSharedRoutines: async (
    sort: SharedRoutineSortType = "latest",
    page: number = 1,
    pageSize: number = 20
  ): Promise<SharedRoutinesResponse> => {
    // TODO: 실제 API 호출
    // return apiClient.get(`/community/routines?sort=${sort}&page=${page}&pageSize=${pageSize}`);

    await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

    // Mock: 정렬 적용
    const items = [...MOCK_SHARED_ROUTINES.items];
    if (sort === "popular") {
      items.sort((a, b) => b.likeCount - a.likeCount);
    } else if (sort === "imported") {
      items.sort((a, b) => b.importCount - a.importCount);
    }

    return {
      ...MOCK_SHARED_ROUTINES,
      items,
      page,
      pageSize,
    };
  },

  // 내가 좋아요한 루틴 목록
  getLikedRoutines: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<SharedRoutinesResponse> => {
    // TODO: 실제 API 호출
    // return apiClient.get(`/community/routines/liked?page=${page}&pageSize=${pageSize}`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const likedItems = MOCK_SHARED_ROUTINES.items.filter((item) => item.isLiked);

    return {
      items: likedItems,
      total: likedItems.length,
      page,
      pageSize,
      hasNext: false,
    };
  },

  // 공유 루틴 상세 조회
  getSharedRoutineDetail: async (id: number): Promise<SharedRoutineDetail> => {
    // TODO: 실제 API 호출
    // return apiClient.get(`/community/routines/${id}`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const item = MOCK_SHARED_ROUTINES.items.find((r) => r.id === id);
    if (!item) throw new Error("Routine not found");

    return {
      ...item,
      routineSnapshot: {
        routineId: 1,
        title: item.title,
        description: item.content,
        exercises: [
          {
            exerciseId: 1,
            exerciseName: "벤치프레스",
            bodyPart: "CHEST",
            order: 1,
            targetSets: 4,
            targetReps: 10,
          },
          {
            exerciseId: 2,
            exerciseName: "인클라인 덤벨 프레스",
            bodyPart: "CHEST",
            order: 2,
            targetSets: 3,
            targetReps: 12,
          },
        ],
      },
      lastSessionSnapshot: {
        sessionId: 1,
        completedAt: "2024-02-25T10:30:00Z",
        duration: 3600,
        totalVolume: 15420,
        totalSets: 15,
        exercises: [
          {
            exerciseId: 1,
            exerciseName: "벤치프레스",
            sets: [
              { weight: 80, reps: 10 },
              { weight: 85, reps: 8 },
              { weight: 90, reps: 6 },
              { weight: 90, reps: 6 },
            ],
            totalVolume: 3060,
          },
        ],
      },
    };
  },

  // 루틴 좋아요
  likeRoutine: async (id: number): Promise<void> => {
    // TODO: 실제 API 호출
    // return apiClient.post(`/community/routines/${id}/like`);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const item = MOCK_SHARED_ROUTINES.items.find((r) => r.id === id);
    if (item) {
      item.isLiked = true;
      item.likeCount += 1;
    }
  },

  // 루틴 좋아요 취소
  unlikeRoutine: async (id: number): Promise<void> => {
    // TODO: 실제 API 호출
    // return apiClient.delete(`/community/routines/${id}/like`);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const item = MOCK_SHARED_ROUTINES.items.find((r) => r.id === id);
    if (item) {
      item.isLiked = false;
      item.likeCount -= 1;
    }
  },

  // 루틴 가져오기
  importRoutine: async (id: number): Promise<{ routineId: number }> => {
    // TODO: 실제 API 호출
    // return apiClient.post(`/community/routines/${id}/import`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const item = MOCK_SHARED_ROUTINES.items.find((r) => r.id === id);
    if (item) {
      item.importCount += 1;
    }

    return { routineId: 999 }; // Mock: 새로 생성된 루틴 ID
  },

  // 공유 루틴 생성
  createSharedRoutine: async (
    data: CreateSharedRoutineRequest
  ): Promise<{ id: number }> => {
    // TODO: 실제 API 호출
    // return apiClient.post(`/community/routines`, data);

    await new Promise((resolve) => setTimeout(resolve, 500));

    return { id: 999 }; // Mock: 생성된 공유 루틴 ID
  },

  // 공유 루틴 삭제
  deleteSharedRoutine: async (id: number): Promise<void> => {
    // TODO: 실제 API 호출
    // return apiClient.delete(`/community/routines/${id}`);

    await new Promise((resolve) => setTimeout(resolve, 300));
  },
};
