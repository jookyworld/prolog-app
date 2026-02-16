export type BodyPart =
  | "CHEST"
  | "SHOULDER"
  | "BACK"
  | "ARM"
  | "LOWER_BODY"
  | "CORE"
  | "CARDIO"
  | "OTHER";

export const BODY_PART_LABEL: Record<BodyPart, string> = {
  CHEST: "가슴",
  SHOULDER: "어깨",
  BACK: "등",
  ARM: "팔",
  LOWER_BODY: "하체",
  CORE: "코어",
  CARDIO: "유산소",
  OTHER: "기타",
};

export const BODY_PARTS: BodyPart[] = [
  "CHEST",
  "BACK",
  "SHOULDER",
  "LOWER_BODY",
  "ARM",
  "CORE",
  "CARDIO",
  "OTHER",
];

export interface ExerciseResponse {
  id: number;
  name: string;
  bodyPart: BodyPart;
  partDetail: string;
  custom: boolean;
}
