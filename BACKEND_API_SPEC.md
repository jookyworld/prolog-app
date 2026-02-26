# 홈 화면 통계 API 개발 스펙

## 주요 결정사항

1. **주간 목표(goal)**: 현재 하드코딩 `5`로 처리 (추후 User.weeklyGoal 필드 추가 예정)
2. **exerciseProgress 개수**: 최대 5개 (조건 만족 시)
3. **sessions 정렬**: 오름차순(ASC) - 차트는 오래된 데이터부터 표시
4. **weeklyActivity 기간**: 오늘 포함 7일 (예: 2/25라면 2/19~2/25)
5. **DB 스키마**: SQL 예시는 참고용이며, 실제 스키마에 맞게 조정 필요
6. **한국어 요일**: 백엔드에서 "월/화/수/목/금/토/일" 형식으로 변환

## API 엔드포인트

```
GET /api/workout/stats/home
```

## 응답 DTO

```typescript
interface HomeStatsResponse {
  thisWeek: {
    workouts: number;        // 이번 주 운동 횟수 (월~일 기준)
    goal: number;            // 주간 목표 (현재 하드코딩 5, 추후 User.weeklyGoal 필드 추가 예정)
  };
  thisMonth: {
    workouts: number;        // 이번 달 운동 횟수 (1일~오늘)
  };
  avgWorkoutDuration: number; // 이번 달 평균 운동 시간 (초)

  weeklyActivity: DailyActivity[];      // 오늘 포함 과거 7일 (오래된 순)
  exerciseProgress: ExerciseProgress[]; // 최대 5개 (조건 만족 시)
  recentWorkouts: RecentWorkoutSummary[]; // 최대 5개
}

interface DailyActivity {
  date: string;              // "2024-02-25" (ISO 형식)
  dayOfWeek: string;         // "화" (월/화/수/목/금/토/일)
  formattedDate: string;     // "2/25" (M/D 형식)
  workoutCount: number;      // 해당 날짜 운동 횟수
  bodyParts: BodyPart[];     // 운동한 부위들 (중복 제거됨)
}

interface ExerciseProgress {
  exerciseId: number;
  exerciseName: string;
  bodyPart: BodyPart;
  sessions: ExerciseSession[]; // 최근 5회 세션 (오래된 순 정렬, 차트용)
}

interface ExerciseSession {
  date: string;              // "2/10" (M/D 형식)
  totalVolume: number;       // 해당 운동의 총 볼륨 (kg, 정수)
  routineName: string;       // 루틴명 또는 "자유 운동"
  sets: SetDetail[];         // 세트 상세 정보
}

interface SetDetail {
  weight: number;
  reps: number;
}

interface RecentWorkoutSummary {
  sessionId: number;
  title: string;             // 루틴명 또는 "자유 운동"
  completedAt: string;       // ISO 8601 형식
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  duration: number;          // 초
}
```

## 비즈니스 로직

### 1. thisWeek 계산
```sql
-- 이번 주 월요일~일요일 기준
SELECT COUNT(DISTINCT DATE(completed_at)) as workouts
FROM workout_sessions
WHERE user_id = :userId
  AND completed_at >= :thisWeekMonday  -- 이번 주 월요일 00:00
  AND completed_at <= :thisWeekSunday  -- 이번 주 일요일 23:59
```

### 2. thisMonth 계산
```sql
-- 이번 달 1일~오늘
SELECT COUNT(DISTINCT DATE(completed_at)) as workouts
FROM workout_sessions
WHERE user_id = :userId
  AND completed_at >= :firstDayOfMonth  -- 이번 달 1일 00:00
  AND completed_at <= :now               -- 오늘 23:59
```

### 3. avgWorkoutDuration 계산
```sql
-- 이번 달 평균 운동 시간
SELECT AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)) as avg_duration
FROM workout_sessions
WHERE user_id = :userId
  AND completed_at >= :firstDayOfMonth
  AND completed_at <= :now
  AND started_at IS NOT NULL
```

### 4. weeklyActivity 계산
```
1. 오늘 포함 과거 7일 날짜 생성
   - 예: 오늘이 2/25(화)라면 → 2/19(수) ~ 2/25(화)
2. 각 날짜별로:
   - 해당 날짜의 세션 조회
   - workoutCount = 세션 수
   - bodyParts = 모든 세션의 운동 종목 bodyPart 수집 → 중복 제거
3. 배열 순서: 오래된 날짜부터 (2/19, 2/20, ..., 2/25)
```

**한국어 요일 유틸:**
```typescript
const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];
const dayOfWeek = DAYS_KR[new Date(date).getDay()];
```

```sql
-- 특정 날짜의 운동 부위 조회
SELECT DISTINCT e.body_part
FROM workout_sessions ws
JOIN workout_exercises we ON ws.id = we.session_id
JOIN exercises e ON we.exercise_id = e.id
WHERE ws.user_id = :userId
  AND DATE(ws.completed_at) = :targetDate

-- 주의: 실제 DB 스키마에 맞게 조정 필요 (예: workout_exercises가 없는 경우)
```

### 5. exerciseProgress 선정

**선정 조건:**
- 최근 1달 내 수행한 운동
- 최소 3회 이상 수행한 운동
- 빈도 순으로 정렬
- 최대 5개 선택 (조건 만족하는 운동이 5개 미만이면 있는 만큼만 반환)

```sql
-- STEP 1: 최근 1달 내 운동별 빈도 계산
SELECT
  e.id as exercise_id,
  e.name as exercise_name,
  e.body_part,
  COUNT(DISTINCT ws.id) as frequency
FROM workout_sessions ws
JOIN workout_exercises we ON ws.id = we.session_id
JOIN exercises e ON we.exercise_id = e.id
WHERE ws.user_id = :userId
  AND ws.completed_at >= NOW() - INTERVAL 30 DAY
GROUP BY e.id, e.name, e.body_part
HAVING frequency >= 3
ORDER BY frequency DESC
LIMIT 5;

-- STEP 2: 각 운동의 최근 5회 세션 데이터 조회 (차트를 위해 오래된 순 정렬)
SELECT
  DATE_FORMAT(ws.completed_at, '%c/%e') as date,  -- "2/10" 형식
  SUM(wes.weight * wes.reps) as total_volume,     -- 정수로 반환
  COALESCE(r.title, '자유 운동') as routine_name,
  JSON_ARRAYAGG(
    JSON_OBJECT('weight', wes.weight, 'reps', wes.reps)
  ) as sets
FROM workout_sessions ws
LEFT JOIN routines r ON ws.routine_id = r.id
JOIN workout_exercises we ON ws.id = we.session_id
JOIN workout_sets wes ON we.id = wes.workout_exercise_id
WHERE ws.user_id = :userId
  AND we.exercise_id = :exerciseId
GROUP BY ws.id, ws.completed_at, r.title
ORDER BY ws.completed_at ASC  -- 오름차순 (오래된 순)
LIMIT 5;

-- 주의: workout_exercises 테이블이 없다면 현재 DB 스키마에 맞게 쿼리 수정 필요
```

### 6. recentWorkouts 계산

```sql
SELECT
  ws.id as session_id,
  COALESCE(r.title, '자유 운동') as title,
  ws.completed_at,
  COUNT(DISTINCT we.exercise_id) as exercise_count,
  COUNT(DISTINCT wes.id) as total_sets,
  SUM(wes.weight * wes.reps) as total_volume,
  TIMESTAMPDIFF(SECOND, ws.started_at, ws.completed_at) as duration
FROM workout_sessions ws
LEFT JOIN routines r ON ws.routine_id = r.id
JOIN workout_exercises we ON ws.id = we.session_id
JOIN workout_sets wes ON we.id = wes.workout_exercise_id
WHERE ws.user_id = :userId
GROUP BY ws.id, r.title, ws.completed_at, ws.started_at
ORDER BY ws.completed_at DESC
LIMIT 5;
```

## 구현 체크리스트

- [ ] 날짜 계산 유틸 함수 (이번 주 월요일, 이번 달 1일 등)
- [ ] thisWeek, thisMonth 계산
- [ ] avgWorkoutDuration 계산
- [ ] weeklyActivity 생성 (최근 7일)
- [ ] 운동별 빈도 계산 및 TOP 5 선정
- [ ] 선정된 운동의 최근 5회 세션 데이터 조회
- [ ] bodyPart 배열 중복 제거
- [ ] recentWorkouts 조회
- [ ] 모든 데이터 통합하여 응답

## 에러 처리

- 사용자가 운동 기록이 없는 경우: 빈 배열 반환
- 날짜 계산 오류: 적절한 기본값 반환
- exerciseProgress 조건 미달: 빈 배열 반환 (정상 동작)

## 성능 최적화

- 인덱스: `workout_sessions(user_id, completed_at)`
- 인덱스: `workout_exercises(session_id, exercise_id)` (테이블 존재 시)
- 캐싱: 1-5분 (사용자별)

## 참고사항

- 모든 날짜는 **한국 시간 기준(KST)** 사용
- `totalVolume`은 **정수**로 반환 (소수점 없음)
- SQL 쿼리는 예시이며, **실제 DB 스키마에 맞게 조정** 필요
- 날짜 형식: ISO(`2024-02-25`), M/D(`2/25`), 요일(`화`) 일관성 유지
