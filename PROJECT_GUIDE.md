# ProLog App - 프로젝트 가이드

## 목차

1. [폴더 구조](#1-폴더-구조)
2. [설정 파일](#2-설정-파일)
3. [화면과 라우팅 (app/)](#3-화면과-라우팅-app)
4. [재사용 컴포넌트 (components/)](#4-재사용-컴포넌트-components)
5. [전역 상태 관리 (contexts/)](#5-전역-상태-관리-contexts)
6. [비즈니스 로직과 유틸리티 (lib/)](#6-비즈니스-로직과-유틸리티-lib)
7. [인증 구조와 흐름](#7-인증-구조와-흐름)
8. [주요 기능별 흐름](#8-주요-기능별-흐름)
9. [개발 패턴 가이드](#9-개발-패턴-가이드)

---

## 1. 폴더 구조

```
prolog-app/
├── app/                    ← 화면(페이지) 정의 (파일 기반 라우팅)
│   ├── _layout.tsx         ← 앱 전체를 감싸는 루트 레이아웃
│   ├── (auth)/             ← 비로그인 사용자용 화면 그룹
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── (tabs)/             ← 로그인 후 탭 네비게이션 그룹
│       ├── _layout.tsx
│       ├── index.tsx       ← 홈 탭 (플레이스홀더)
│       ├── routine/
│       │   ├── _layout.tsx
│       │   ├── index.tsx   ← 루틴 목록
│       │   └── [id].tsx    ← 루틴 상세
│       ├── workout/
│       │   ├── _layout.tsx
│       │   ├── index.tsx   ← 운동 탭 메인 (안내 카드)
│       │   └── session.tsx ← 운동 세션 (핵심 기능)
│       ├── community.tsx   ← 커뮤니티 탭 (플레이스홀더)
│       └── profile/
│           ├── _layout.tsx
│           ├── index.tsx   ← 프로필 메인
│           ├── settings.tsx← 설정 (로그아웃/탈퇴)
│           └── history/
│               ├── _layout.tsx
│               ├── index.tsx  ← 운동 기록 목록
│               └── [id].tsx   ← 운동 기록 상세
├── components/             ← 재사용 가능한 UI 컴포넌트
│   ├── AuthGuard.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Label.tsx
├── contexts/               ← React Context (전역 상태 관리)
│   └── auth-context.tsx
├── lib/                    ← 비즈니스 로직, 유틸리티
│   ├── constants.ts        ← 상수 (API URL, 색상)
│   ├── utils.ts            ← 유틸리티 함수
│   ├── api.ts              ← HTTP 클라이언트 (토큰 관리 포함)
│   ├── api/
│   │   ├── auth.ts         ← 인증 API
│   │   ├── routine.ts      ← 루틴 API
│   │   └── workout.ts      ← 운동 세션 API
│   ├── types/
│   │   ├── auth.ts         ← 인증 타입
│   │   ├── routine.ts      ← 루틴 타입
│   │   └── workout.ts      ← 운동 세션 타입
│   └── validations/
│       └── auth.ts         ← Zod 유효성 검증 스키마
├── app.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── tsconfig.json
├── global.css
└── .env
```

---

## 2. 설정 파일

| 파일 | 역할 | 언제 수정하나 |
|------|------|-------------|
| `app.json` | Expo 프로젝트 설정 (앱 이름, 아이콘, 스플래시, 플랫폼별 설정) | 앱 이름/아이콘 변경, 네이티브 권한 추가 시 |
| `babel.config.js` | JSX를 NativeWind가 처리하도록 설정 | 거의 수정할 일 없음 |
| `metro.config.js` | Metro 번들러에 NativeWind 연결 | 거의 수정할 일 없음 |
| `tailwind.config.js` | 커스텀 색상, 폰트 등 디자인 토큰 정의 | 새 색상/스타일 추가 시 |
| `tsconfig.json` | TypeScript 설정 + `@/*` 경로 별칭 | 경로 별칭 추가 시 |
| `global.css` | Tailwind의 `@tailwind` 지시어 3줄 | 전역 커스텀 CSS 추가 시 |
| `.env` | 환경변수 (`EXPO_PUBLIC_API_URL`) | API 서버 주소 변경 시 |

---

## 3. 화면과 라우팅 (app/)

Expo Router는 **파일 기반 라우팅**을 사용한다. 파일 경로가 곧 URL 경로가 된다.

### 3.1 루트 레이아웃 — `app/_layout.tsx`

```tsx
<AuthProvider>        ← 전역 인증 상태 제공
  <StatusBar />       ← 상태바 밝은 글씨 (다크 테마)
  <AuthGuard>         ← 로그인 여부에 따라 라우팅 제어
    <Slot />          ← 여기에 하위 화면이 렌더링됨
  </AuthGuard>
</AuthProvider>
```

- `Slot` — 현재 URL에 해당하는 자식 레이아웃/화면을 렌더링하는 자리. 웹의 `{children}`과 같은 개념.

### 3.2 라우트 그룹 — `(auth)`, `(tabs)`

괄호 `()` 폴더는 **URL에 포함되지 않는 그룹**이다. 레이아웃을 분리하기 위한 용도.

- `(auth)` — 로그인/회원가입 화면. **Stack 네비게이션** (화면이 위로 쌓이는 방식)
- `(tabs)` — 로그인 후 화면. **Tab 네비게이션** (하단 탭 방식)

### 3.3 Auth 화면

#### 로그인 — `app/(auth)/login.tsx`

```
사용자 입력 (아이디/비밀번호)
  └─ zod 스키마 유효성 검사 (react-hook-form)
       └─ useAuth().login(data) 호출
            ├─ 성공 → router.replace("/(tabs)")
            └─ 실패 → 에러 메시지 표시
```

#### 회원가입 — `app/(auth)/signup.tsx`

2단계 폼 구조 (프로그레스 바 표시):

```
Step 1: 계정 정보 (아이디 4~20자, 비밀번호 8~30자, 이메일, 닉네임 2~10자)
  └─ "다음" 버튼 → step1Data 저장 후 Step 2로

Step 2: 신체 정보 (성별 MALE/FEMALE 토글, 키, 체중)
  └─ "가입 완료" 버튼 → step1Data + step2Data 합쳐서 signup() 호출
       ├─ 성공 → 자동 로그인 → /(tabs)로 이동
       └─ 실패 → 에러 메시지 표시
```

### 3.4 Tabs 레이아웃 — `app/(tabs)/_layout.tsx`

```
<Tabs>
  index     → "홈"      (Home 아이콘)       ← 플레이스홀더
  routine   → "루틴"    (LayoutGrid 아이콘)
  workout   → "운동"    (Dumbbell 아이콘)
  community → "커뮤니티" (Users 아이콘)      ← 플레이스홀더
  profile   → "내 정보"  (User 아이콘)
</Tabs>
```

하단 5개 탭을 정의. 각 탭 폴더 내 `_layout.tsx`는 Stack 네비게이터를 사용하여 상세 화면으로의 전환을 지원한다.

### 3.5 루틴 탭

#### 루틴 목록 — `app/(tabs)/routine/index.tsx`

- `routineApi.getRoutines()`으로 목록 조회
- 각 카드: 제목, 설명, 생성 날짜, 활성 배지
- 로딩/에러/빈 상태 처리
- 카드 탭 → `/(tabs)/routine/[id]`로 이동
- 헤더 + 버튼 (루틴 생성 기능은 미구현)

#### 루틴 상세 — `app/(tabs)/routine/[id].tsx`

- `routineApi.getRoutineDetail(id)`로 상세 조회
- 요약 카드: 제목 + 활성 배지 + 설명
- 운동 구성 목록: 순서 번호, 운동명, 부위, 세트 수, 휴식 시간
- **"운동 시작" 버튼** → `/(tabs)/workout/session?routineId=<id>`
- "루틴 삭제" 버튼 → 확인 Alert → API 삭제 → 목록으로 복귀

### 3.6 운동 탭

#### 운동 메인 — `app/(tabs)/workout/index.tsx`

- "루틴으로 운동 시작" 안내 카드
- "루틴 보러가기" 버튼 → `/(tabs)/routine`으로 이동

#### 운동 세션 — `app/(tabs)/workout/session.tsx` ★ 핵심 기능

루틴 기반 운동 기록 화면. `routineId` 쿼리 파라미터로 진입.

**레이아웃:**
- 헤더: "그만하기" (왼쪽) | 루틴 제목 (가운데) | "완료" (오른쪽)
- 운동 탭 네비게이션 (횡 스크롤, 현재 운동 primary 하이라이트)
- 세트 테이블: 세트 번호 | 무게(kg) 입력 | 횟수 입력 | 완료 체크(✓)
- 세트 추가/삭제 버튼
- "다음 운동" 버튼 (마지막 운동이 아닐 때)
- 하단 타이머 바 (경과 시간 HH:MM:SS)

**동작 흐름:**
```
진입 시:
  ├─ routineApi.getRoutineDetail(routineId) → 운동 구성 초기화
  └─ workoutApi.startSession(routineId) → sessionId 저장

운동 중:
  ├─ 운동 탭 전환으로 운동 간 이동
  ├─ 세트별 무게/횟수 입력 + 완료 체크
  ├─ 세트 추가/삭제 가능
  └─ 타이머 자동 카운트 (1초 interval)

"완료" 시:
  └─ 완료된 세트만 필터 → workoutApi.completeSession(sessionId, sets) → 복귀

"그만하기" 시:
  └─ workoutApi.cancelSession(sessionId) → 복귀 (기록 저장 안 됨)
```

**상태 관리 (useState):**
| 상태 | 타입 | 설명 |
|------|------|------|
| `exercises` | `ActiveExercise[]` | 운동 목록 + 각 세트 (weight/reps는 string) |
| `currentIndex` | `number` | 현재 선택된 운동 인덱스 |
| `elapsedTime` | `number` | 경과 시간 (초) |
| `sessionId` | `number \| null` | 백엔드 세션 ID |
| `routineTitle` | `string` | 헤더에 표시할 루틴 제목 |

### 3.7 프로필 탭

#### 프로필 메인 — `app/(tabs)/profile/index.tsx`

- `useAuth()`에서 유저 정보 조회
- 아바타 + 닉네임 + 성별 배지 (남성/여성)
- 이메일, 키(cm), 체중(kg) 표시
- 설정 아이콘(⚙) → `/(tabs)/profile/settings`
- "운동 기록 보관함" 메뉴 → `/(tabs)/profile/history`

#### 설정 — `app/(tabs)/profile/settings.tsx`

- "로그아웃": 확인 Alert → `useAuth().logout()` → 로그인 화면
- "회원 탈퇴": 확인 Alert (destructive) → `useAuth().deleteAccount()` → 로그인 화면

#### 운동 기록 목록 — `app/(tabs)/profile/history/index.tsx`

- `workoutApi.getSessions()`으로 전체 기록 조회
- 필터 칩: 전체 / 루틴 / 자유 운동 (클라이언트 사이드 필터)
- 완료일 기준 내림차순 정렬
- 상대 날짜 표시 (오늘/어제/N일 전/날짜)
- 카드 탭 → `/(tabs)/profile/history/[id]`

#### 운동 기록 상세 — `app/(tabs)/profile/history/[id].tsx`

- `workoutApi.getSessionDetail(id)` → `toWorkoutSessionDetail()` 변환
- 요약 카드: 제목, 루틴/자유 배지, 2×2 통계 (날짜, 운동 시간, 총 세트, 총 볼륨)
- 운동별 카드: 운동명, 볼륨 소계, 세트 테이블 (번호/무게/횟수)

---

## 4. 재사용 컴포넌트 (components/)

### 4.1 AuthGuard.tsx — 라우팅 보호

```
isLoading 중            → 로딩 스피너 표시
user 없음 + auth 밖     → /(auth)/login으로 강제 이동
user 있음 + auth 안     → /(tabs)로 강제 이동
그 외                   → children 정상 렌더링
```

핵심 훅:
- `useSegments()` — 현재 URL 경로를 배열로 반환
- `useRouter()` — `router.replace()`로 화면 이동

### 4.2 ui/Button.tsx — 버튼

CVA (Class Variance Authority) 패턴. variant(`default`, `outline`, `ghost`, `destructive`) × size(`sm`, `default`, `lg`, `icon`) 조합. `loading` 시 스피너 표시.

### 4.3 ui/Input.tsx — 텍스트 입력

`TextInput` 래핑. 다크 테마 스타일 기본 적용. `forwardRef`로 외부 포커스 제어 가능.

### 4.4 ui/Card.tsx — 카드 컨테이너

`View`에 `rounded-2xl bg-card p-4` 기본 적용.

### 4.5 ui/Label.tsx — 폼 라벨

`Text`에 `text-sm text-muted-foreground` 기본 적용.

---

## 5. 전역 상태 관리 (contexts/)

### auth-context.tsx

React Context API 패턴으로 인증 상태 관리.

| 이름 | 타입 | 설명 |
|------|------|------|
| `user` | `UserResponse \| null` | 현재 로그인한 사용자 정보 |
| `isLoading` | `boolean` | 앱 시작 시 토큰 확인 중 여부 |
| `login(data)` | 함수 | 로그인 → user 상태 설정 |
| `signup(data)` | 함수 | 회원가입 → 자동 로그인 → user 상태 설정 |
| `logout()` | 함수 | API 로그아웃 → user를 null로 |
| `deleteAccount()` | 함수 | 회원탈퇴 → user를 null로 |

```tsx
const { user, login, logout } = useAuth();
```

---

## 6. 비즈니스 로직과 유틸리티 (lib/)

### 6.1 constants.ts — 상수 정의

```ts
API_URL  → .env의 EXPO_PUBLIC_API_URL (기본값: http://localhost:8080)
COLORS   → { background, card, primary, primaryHover, border, mutedForeground, destructive, white }
```

`tailwind.config.js`의 색상과 동일한 값. Tailwind className으로 안 되는 곳에서 사용.

### 6.2 utils.ts — cn() 유틸리티

```ts
cn("text-white", isActive && "text-primary", className)
```

`clsx` + `twMerge`로 조건부 클래스 조합 및 Tailwind 충돌 해결.

### 6.3 api.ts — HTTP 클라이언트

| 함수 | 역할 |
|------|------|
| `apiFetch<T>(path, options)` | 모든 API 호출의 공통 래퍼. 토큰 자동 부착 + 401 시 자동 갱신 |
| `refreshAccessToken()` | refreshToken으로 새 accessToken 발급 |
| `setTokens(access, refresh)` | SecureStore에 토큰 저장 |
| `clearTokens()` | SecureStore에서 토큰 삭제 |
| `hasTokens()` | 토큰 존재 여부 확인 |

### 6.4 api/auth.ts — 인증 API

| 함수 | 메서드 | 경로 | 동작 |
|------|--------|------|------|
| `authApi.login(data)` | POST | `/api/auth/login` | 로그인 → 토큰 저장 |
| `authApi.signup(data)` | POST | `/api/auth/signup` | 회원가입 |
| `authApi.me()` | GET | `/api/auth/me` | 현재 사용자 정보 조회 |
| `authApi.logout()` | POST | `/api/auth/logout` | 로그아웃 → 토큰 삭제 |
| `authApi.deleteMe()` | DELETE | `/api/auth/deleteMe` | 회원탈퇴 → 토큰 삭제 |

### 6.5 api/routine.ts — 루틴 API

| 함수 | 메서드 | 경로 | 동작 |
|------|--------|------|------|
| `routineApi.getRoutines()` | GET | `/api/routines` | 루틴 목록 조회 |
| `routineApi.getRoutineDetail(id)` | GET | `/api/routines/:id` | 루틴 상세 (운동 구성 포함) |
| `routineApi.deleteRoutine(id)` | DELETE | `/api/routines/:id` | 루틴 삭제 |

### 6.6 api/workout.ts — 운동 세션 API

| 함수 | 메서드 | 경로 | 동작 |
|------|--------|------|------|
| `workoutApi.getSessions()` | GET | `/api/workouts/sessions` | 세션 목록 (page=0, size=100) |
| `workoutApi.getSessionDetail(id)` | GET | `/api/workouts/sessions/:id` | 세션 상세 (운동/세트 포함) |
| `workoutApi.startSession(routineId)` | POST | `/api/workouts/sessions` | 세션 생성 및 시작 |
| `workoutApi.completeSession(id, body)` | PATCH | `/api/workouts/sessions/:id/complete` | 세트 기록 후 세션 완료 |
| `workoutApi.cancelSession(id)` | DELETE | `/api/workouts/sessions/:id/cancel` | 세션 취소 (기록 삭제) |

### 6.7 types/auth.ts — 인증 타입

| 타입 | 용도 |
|------|------|
| `SignupRequest` | 회원가입 요청 (username, password, email, nickname, gender, height, weight) |
| `LoginRequest` | 로그인 요청 (username, password) |
| `UserResponse` | 사용자 정보 응답 |
| `LoginResponse` | 로그인 응답 (userResponse, accessToken, refreshToken) |

### 6.8 types/routine.ts — 루틴 타입

| 타입 | 용도 |
|------|------|
| `RoutineItemRes` | 루틴 운동 항목 (exerciseId, exerciseName, bodyPart, partDetail, sets, restSeconds) |
| `RoutineListItem` | 루틴 목록 아이템 (id, title, description, active, createdAt, updatedAt) |
| `RoutineDetail` | 루틴 상세 (RoutineListItem + routineItems[]) |

### 6.9 types/workout.ts — 운동 세션 타입

**백엔드 응답 타입:**

| 타입 | 용도 |
|------|------|
| `WorkoutSessionListItemRes` | 세션 목록 아이템 (sessionId, routineId, routineTitle, startedAt, completedAt) |
| `PageWorkoutSessionListItemRes` | 페이지네이션 래퍼 (content[], totalPages, totalElements, first, last) |
| `WorkoutSetRes` | 세트 응답 (setId, setNumber, weight, reps) |
| `WorkoutExerciseRes` | 운동 응답 (exerciseId, exerciseName, sets[]) |
| `WorkoutSessionDetailRes` | 세션 상세 응답 (exercises[] 포함) |

**세션 요청 타입:**

| 타입 | 용도 |
|------|------|
| `WorkoutSessionStartReq` | 세션 시작 요청 `{ routineId }` |
| `WorkoutSessionStartRes` | 세션 시작 응답 (id, routineId, routineTitle, startedAt, completedAt) |
| `WorkoutSetCompleteReq` | 세트 완료 데이터 `{ exerciseId, setNumber, weight, reps }` |
| `WorkoutSessionCompleteReq` | 세션 완료 요청 `{ action: "RECORD_ONLY", sets[] }` |

**클라이언트 상태 타입 (운동 중):**

| 타입 | 용도 |
|------|------|
| `ActiveExercise` | 운동 중 운동 상태 (id, exerciseId, name, sets[]) |
| `ActiveSet` | 운동 중 세트 상태 (id, setNumber, weight: string, reps: string, completed) |

**앱 표시 타입 (기록 조회):**

| 타입 | 용도 |
|------|------|
| `WorkoutSession` | 변환된 세션 (id, title, type, completedAt) |
| `WorkoutSessionDetail` | 변환된 상세 (elapsedTime, totalSets, totalVolume, exercises[]) |

**변환 함수:**
- `toWorkoutSession(res)` → 목록용 변환
- `toWorkoutSessionDetail(res)` → 상세용 변환 (경과시간/총세트/총볼륨 계산)

### 6.10 validations/auth.ts — 폼 유효성 검증

| 스키마 | 검증 규칙 |
|--------|----------|
| `loginSchema` | 아이디/비밀번호 필수 입력 |
| `signupStep1Schema` | 아이디 4~20자, 비밀번호 8~30자, 이메일 형식, 닉네임 2~10자 |
| `signupStep2Schema` | 성별 선택 필수, 키 100~250cm, 체중 30~300kg |

---

## 7. 인증 구조와 흐름

### 7.1 전체 아키텍처

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Screen     │ ──▶ │  AuthContext  │ ──▶ │  authApi     │ ──▶ │ apiFetch │ ──▶ Backend
│  (login.tsx)│     │  (상태 관리)   │     │  (API 호출)   │     │ (HTTP)   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
                           │                                       │
                           │                                ┌──────────────┐
                           └── user 상태 갱신                │ SecureStore  │
                                                            │ (토큰 저장)   │
                                                            └──────────────┘
```

### 7.2 토큰 저장

`expo-secure-store`를 사용하여 기기의 암호화된 저장소에 토큰을 보관한다.

| 키 | 용도 |
|---|---|
| `prolog_access_token` | API 요청 인증용 (짧은 수명) |
| `prolog_refresh_token` | access token 갱신용 (긴 수명) |

### 7.3 API 요청 흐름 (apiFetch)

**요청 시:**
1. SecureStore에서 accessToken을 꺼냄
2. `Authorization: Bearer {token}` 헤더를 자동 부착
3. `API_URL + path`로 fetch 실행

**응답 처리:**
- 200~299 → JSON 파싱 후 반환
- 204 → undefined 반환 (No Content)
- 401 (login/refresh 제외) → 토큰 갱신 시도 후 재요청
- 그 외 에러 → `ApiError` throw

### 7.4 토큰 자동 갱신

```
요청 → 401 응답
  └─ refreshAccessToken() 호출
       └─ POST /api/auth/refresh (refreshToken 전송)
            ├─ 성공 → 새 토큰 저장 → 원래 요청 재시도
            └─ 실패 → 토큰 삭제 → "인증 만료" 에러 throw
```

`refreshPromise` 변수로 동시에 여러 요청이 401을 받아도 **갱신 요청은 1번만** 실행.

---

## 8. 주요 기능별 흐름

### 8.1 루틴 조회 흐름

```
루틴 탭 진입
  └─ routineApi.getRoutines() → 목록 표시
       └─ 카드 탭 → routineApi.getRoutineDetail(id) → 상세 표시
            ├─ 운동 구성 (운동명, 부위, 세트 수, 휴식 시간)
            ├─ "운동 시작" → 운동 세션 화면으로 이동
            └─ "루틴 삭제" → 확인 → API 삭제 → 목록 복귀
```

### 8.2 운동 세션 흐름

```
루틴 상세 → "운동 시작" 버튼
  └─ workout/session?routineId=<id>

세션 초기화 (병렬 실행):
  ├─ routineApi.getRoutineDetail(routineId) → exercises 초기화
  └─ workoutApi.startSession(routineId) → sessionId 저장

운동 기록:
  ├─ 운동 탭 전환 (횡 스크롤)
  ├─ 세트별 무게/횟수 입력 → 완료 체크(✓)
  ├─ 세트 추가/삭제
  ├─ "다음 운동" 버튼
  └─ 타이머 자동 카운트

종료:
  ├─ "완료" → 완료된 세트 필터 → PATCH complete (action: RECORD_ONLY) → 복귀
  └─ "그만하기" → DELETE cancel → 복귀 (기록 없음)
```

### 8.3 운동 기록 조회 흐름

```
프로필 → "운동 기록 보관함"
  └─ workoutApi.getSessions() → 목록 표시
       ├─ 필터: 전체 / 루틴 / 자유 운동
       └─ 카드 탭 → workoutApi.getSessionDetail(id) → 상세 표시
            ├─ 요약 통계 (날짜, 운동 시간, 총 세트, 총 볼륨)
            └─ 운동별 세트 테이블
```

### 8.4 프로필 관리 흐름

```
프로필 탭 → 유저 정보 표시 (닉네임, 성별, 이메일, 키, 체중)
  ├─ 설정(⚙) → 로그아웃 / 회원 탈퇴
  └─ "운동 기록 보관함" → 기록 목록/상세
```

---

## 9. 개발 패턴 가이드

### 9.1 새 화면 추가하기

```
app/(tabs)/workout/detail.tsx → /workout/detail 경로로 접근 가능
app/(tabs)/workout/[id].tsx   → /workout/123 같은 동적 경로
```

파일을 만들기만 하면 자동으로 라우팅이 등록된다.

### 9.2 새 API 엔드포인트 연결하기

```
1. lib/types/에 요청/응답 타입 정의
2. lib/api/에 API 함수 추가 (apiFetch 사용)
3. 화면에서 호출
```

### 9.3 새 UI 컴포넌트 만들기

```
1. components/ui/에 파일 생성
2. cn()으로 className 합성
3. CVA로 variant 패턴 적용 (필요 시)
```

### 9.4 새 전역 상태 추가하기

```
1. contexts/에 새 context 파일 생성
2. app/_layout.tsx에서 Provider 감싸기
3. 화면에서 useXxx() 훅으로 접근
```

### 9.5 폼 만들기 패턴

`react-hook-form` + `zod` 사용:

```
1. lib/validations/에 zod 스키마 정의
2. useForm({ resolver: zodResolver(schema) })
3. Controller로 각 Input 감싸기
4. handleSubmit(onSubmit)으로 제출
```

### 9.6 주요 사용 라이브러리

| 라이브러리 | 역할 |
|-----------|------|
| `expo-router` | 파일 기반 라우팅 (Stack, Tabs 네비게이션) |
| `nativewind` | React Native에서 Tailwind CSS 사용 |
| `react-hook-form` | 폼 상태 관리 (입력값, 에러, 제출) |
| `zod` | 스키마 기반 유효성 검증 |
| `@hookform/resolvers` | zod ↔ react-hook-form 연결 |
| `expo-secure-store` | 토큰 등 민감 데이터 암호화 저장 |
| `lucide-react-native` | 아이콘 라이브러리 |
| `class-variance-authority` | 컴포넌트 variant 패턴 (Button 등) |
| `clsx` + `tailwind-merge` | 조건부 className 조합 |
| `react-native-safe-area-context` | 노치/홈바 영역 대응 |
| `react-native-screens` | 네이티브 화면 전환 최적화 |
| `react-native-reanimated` | 네이티브 애니메이션 |

---

## 미구현 기능

| 항목 | 상태 |
|------|------|
| 홈 탭 | 플레이스홀더 |
| 커뮤니티 탭 | 플레이스홀더 |
| 루틴 생성/수정 | + 버튼 존재하나 기능 미연결 |
| 자유 운동 (루틴 없이) | 미구현 |
