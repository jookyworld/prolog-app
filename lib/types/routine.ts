export interface RoutineItemRes {
  routineItemId: number;
  orderInRoutine: number;
  exerciseId: number;
  exerciseName: string;
  bodyPart: string;
  partDetail: string;
  sets: number;
  restSeconds: number;
}

export interface RoutineListItem {
  id: number;
  title: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDetail extends RoutineListItem {
  routineItems: RoutineItemRes[];
}

export interface RoutineItemCreateRequest {
  exerciseId: number;
  sets: number;
  restSeconds: number;
}

export interface RoutineCreateRequest {
  title: string;
  description: string;
  routineItems: RoutineItemCreateRequest[];
}
