# ProLog App - 프로젝트 가이드

## 목차

1. [폴더 구조](#1-폴더-구조)
2. [설정 파일](#2-설정-파일)
3. [화면과 라우팅 (app/)](#3-화면과-라우팅-app)
4. [재사용 컴포넌트 (components/)](#4-재사용-컴포넌트-components)
5. [전역 상태 관리 (contexts/)](#5-전역-상태-관리-contexts)
6. [비즈니스 로직과 유틸리티 (lib/)](#6-비즈니스-로직과-유틸리티-lib)
7. [인증 구조와 흐름](#7-인증-구조와-흐름)
8. [개발 패턴 가이드](#8-개발-패턴-가이드)

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
│       ├── index.tsx       ← 홈 탭
│       ├── routine/
│       ├── workout/
│       ├── community.tsx
│       └── profile/
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
│   │   └── auth.ts         ← 인증 API 함수 모음
│   ├── types/
│   │   └── auth.ts         ← TypeScript 타입 정의
│   └── validations/
│       └── auth.ts         ← Zod 유효성 검증 스키마
├── app.json                ← Expo 프로젝트 설정
├── babel.config.js         ← Babel 설정
├── metro.config.js         ← Metro 번들러 설정
├── tailwind.config.js      ← Tailwind CSS 테마 설정
├── tsconfig.json           ← TypeScript 설정
├── global.css              ← Tailwind 진입점
└── .env                    ← 환경변수
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

### 3.3 Auth 레이아웃 — `app/(auth)/_layout.tsx`

```tsx
<Stack screenOptions={{ headerShown: false }}>
```

Stack 네비게이터를 만들되 기본 헤더(뒤로가기 바)는 숨김. login ↔ signup 간 화면 전환에 사용.

### 3.4 Tabs 레이아웃 — `app/(tabs)/_layout.tsx`

```
<Tabs>
  index     → "홈"      (Home 아이콘)
  routine   → "루틴"    (LayoutGrid 아이콘)
  workout   → "운동"    (Dumbbell 아이콘)
  community → "커뮤니티" (Users 아이콘)
  profile   → "내 정보"  (User 아이콘)
</Tabs>
```

하단 5개 탭을 정의. `name`이 폴더/파일명과 매칭된다.

### 3.5 탭 내부 폴더 구조

```
routine/
├── _layout.tsx    ← 이 탭 내부의 네비게이션 (Stack)
└── index.tsx      ← 기본 화면
```

폴더로 만든 이유: 나중에 `routine/detail.tsx`, `routine/[id].tsx` 같은 하위 화면을 추가할 수 있다. `community.tsx`처럼 단일 파일이면 하위 화면 추가가 불가능하다.

### 3.6 로그인 화면 — `app/(auth)/login.tsx`

```
사용자 입력 (아이디/비밀번호)
  └─ zod 스키마 유효성 검사 (react-hook-form)
       └─ useAuth().login(data) 호출
            ├─ 성공 → router.replace("/(tabs)")
            └─ 실패 → 에러 메시지 표시
```

### 3.7 회원가입 화면 — `app/(auth)/signup.tsx`

2단계 폼 구조:

```
Step 1: 계정 정보 (아이디, 비밀번호, 이메일, 닉네임)
  └─ "다음" 버튼 → step1Data 저장 후 Step 2로

Step 2: 신체 정보 (성별, 키, 체중)
  └─ "가입 완료" 버튼 → step1Data + step2Data 합쳐서 signup() 호출
       ├─ 성공 → 자동 로그인 → /(tabs)로 이동
       └─ 실패 → 에러 메시지 표시
```

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
- `useSegments()` — 현재 URL 경로를 배열로 반환 (예: `["(auth)", "login"]`)
- `useRouter()` — `router.replace()`로 화면 이동 (replace = 뒤로가기 불가)

### 4.2 ui/Button.tsx — 버튼

CVA (Class Variance Authority) 패턴을 사용하여 variant와 size를 조합한다.

```tsx
// variant로 스타일 변경
<Button variant="default">      → 파란 배경
<Button variant="outline">      → 테두리만
<Button variant="ghost">        → 투명 배경
<Button variant="destructive">  → 빨간 배경

// size로 크기 변경
<Button size="sm">    → 작은 버튼 (h-9)
<Button size="default"> → 기본 버튼 (h-12)
<Button size="lg">    → 큰 버튼 (h-14)
<Button size="icon">  → 아이콘 전용 정사각형 (h-12 w-12)

// loading 상태
<Button loading={true}>  → 스피너 표시 + 터치 비활성화
```

React Native에서는 HTML `<button>` 대신 `Pressable`을 사용한다.

### 4.3 ui/Input.tsx — 텍스트 입력

React Native의 `TextInput`을 래핑하여 다크 테마 스타일을 기본 적용.
`forwardRef`로 감싸서 외부에서 `ref`로 포커스 제어가 가능하다.

### 4.4 ui/Card.tsx — 카드 컨테이너

React Native의 `View`에 `rounded-2xl bg-card p-4` 스타일을 기본 적용.

### 4.5 ui/Label.tsx — 폼 라벨

React Native의 `Text`에 `text-sm text-muted-foreground` 스타일을 기본 적용.

---

## 5. 전역 상태 관리 (contexts/)

### auth-context.tsx

React의 **Context API** 패턴으로 앱 전역 인증 상태를 관리한다.

#### 제공하는 값

| 이름 | 타입 | 설명 |
|------|------|------|
| `user` | `UserResponse \| null` | 현재 로그인한 사용자 정보. `null`이면 비로그인 |
| `isLoading` | `boolean` | 앱 시작 시 토큰 확인 중 여부 |
| `login(data)` | 함수 | 로그인 → user 상태 설정 |
| `signup(data)` | 함수 | 회원가입 → 자동 로그인 → user 상태 설정 |
| `logout()` | 함수 | API 로그아웃 → user를 null로 |
| `deleteAccount()` | 함수 | 회원탈퇴 → user를 null로 |

#### 사용법

```tsx
const { user, login, logout } = useAuth();
```

어떤 화면에서든 `useAuth()` 훅으로 접근 가능하다.

#### 앱 시작 시 자동 복원 로직 (useEffect)

```
앱 실행 → SecureStore에 토큰이 있나?
  ├─ 있음 → GET /api/auth/me 호출 → user 상태에 저장
  └─ 없음 → isLoading = false → AuthGuard가 로그인 화면으로 보냄
```

---

## 6. 비즈니스 로직과 유틸리티 (lib/)

### 6.1 constants.ts — 상수 정의

```ts
API_URL  → .env의 EXPO_PUBLIC_API_URL (기본값: http://localhost:8080)
COLORS   → 앱 전체에서 쓰는 색상값 (JS에서 직접 참조할 때 사용)
```

`tailwind.config.js`의 색상과 동일한 값이다. Tailwind className으로 안 되는 곳(예: `tabBarStyle`)에서 사용.

### 6.2 utils.ts — cn() 유틸리티

```ts
cn("text-white", isActive && "text-primary", className)
```

- `clsx` — 조건부 클래스 조합 (falsy 값 자동 무시)
- `twMerge` — Tailwind 클래스 충돌 해결 (`text-white` + `text-primary` → `text-primary`만 적용)

모든 UI 컴포넌트에서 외부 className을 받아 합칠 때 사용한다.

### 6.3 api.ts — HTTP 클라이언트

| 함수 | 역할 |
|------|------|
| `apiFetch<T>(path, options)` | 모든 API 호출의 공통 래퍼. 토큰 자동 부착 + 401 시 자동 갱신 |
| `refreshAccessToken()` | refreshToken으로 새 accessToken 발급 |
| `setTokens(access, refresh)` | SecureStore에 토큰 저장 |
| `clearTokens()` | SecureStore에서 토큰 삭제 |
| `hasTokens()` | 토큰 존재 여부 확인 (앱 시작 시 사용) |

### 6.4 api/auth.ts — 인증 API 함수

| 함수 | 메서드 | 경로 | 동작 |
|------|--------|------|------|
| `authApi.login(data)` | POST | `/api/auth/login` | 로그인 → 토큰 저장 |
| `authApi.signup(data)` | POST | `/api/auth/signup` | 회원가입 |
| `authApi.me()` | GET | `/api/auth/me` | 현재 사용자 정보 조회 |
| `authApi.logout()` | POST | `/api/auth/logout` | 로그아웃 → 토큰 삭제 |
| `authApi.deleteMe()` | DELETE | `/api/auth/deleteMe` | 회원탈퇴 → 토큰 삭제 |

`apiFetch`를 사용하므로 토큰 부착/갱신을 신경 쓸 필요 없다.

### 6.5 types/auth.ts — TypeScript 타입

| 타입 | 용도 |
|------|------|
| `SignupRequest` | 회원가입 요청 (username, password, email, nickname, gender, height, weight) |
| `LoginRequest` | 로그인 요청 (username, password) |
| `UserResponse` | 사용자 정보 응답 (id, username, email, nickname, gender, height, weight) |
| `LoginResponse` | 로그인 응답 (userResponse, accessToken, refreshToken) |

### 6.6 validations/auth.ts — 폼 유효성 검증

Zod 스키마로 입력값 검증 규칙을 정의한다. `react-hook-form`의 `zodResolver`에 연결하면 폼 제출 시 자동으로 검증된다.

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

`refreshPromise` 변수로 동시에 여러 요청이 401을 받아도 **갱신 요청은 1번만** 실행되도록 중복 방지한다.

### 7.5 로그인 흐름 전체

```
1. 사용자가 아이디/비밀번호 입력
2. zod 스키마로 유효성 검사
3. authApi.login() → POST /api/auth/login
4. 응답에서 accessToken, refreshToken → SecureStore에 저장
5. userResponse → AuthContext의 user 상태에 저장
6. AuthGuard가 user 존재를 감지 → /(tabs)로 리다이렉트
```

### 7.6 앱 재실행 시 세션 복원

```
1. AuthProvider의 useEffect 실행
2. SecureStore에서 토큰 존재 확인 (hasTokens)
3. GET /api/auth/me 호출
4. 성공 → user 상태 설정 → 자동 로그인 상태 유지
5. 실패 → 로그인 화면으로 이동
```

---

## 8. 개발 패턴 가이드

### 8.1 새 화면 추가하기

```
app/(tabs)/workout/detail.tsx → /workout/detail 경로로 접근 가능
app/(tabs)/workout/[id].tsx   → /workout/123 같은 동적 경로
```

파일을 만들기만 하면 자동으로 라우팅이 등록된다.

### 8.2 새 API 엔드포인트 연결하기

```
1. lib/types/에 요청/응답 타입 정의
2. lib/api/에 API 함수 추가 (apiFetch 사용)
3. 화면에서 호출
```

예시:

```ts
// lib/types/workout.ts
export interface Workout {
  id: number;
  name: string;
}

// lib/api/workout.ts
export const workoutApi = {
  getAll(): Promise<Workout[]> {
    return apiFetch("/api/workouts");
  },
  create(data: CreateWorkoutRequest): Promise<Workout> {
    return apiFetch("/api/workouts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

### 8.3 새 UI 컴포넌트 만들기

```
1. components/ui/에 파일 생성
2. cn()으로 className 합성
3. CVA로 variant 패턴 적용 (필요 시)
```

예시:

```tsx
// components/ui/Badge.tsx
export function Badge({ children, className }: BadgeProps) {
  return (
    <View className={cn("rounded-full bg-primary px-3 py-1", className)}>
      <Text className="text-xs text-white">{children}</Text>
    </View>
  );
}
```

### 8.4 새 전역 상태 추가하기

```
1. contexts/에 새 context 파일 생성
2. app/_layout.tsx에서 Provider 감싸기
3. 화면에서 useXxx() 훅으로 접근
```

예시:

```tsx
// contexts/workout-context.tsx
const WorkoutContext = createContext(...);
export function WorkoutProvider({ children }) { ... }
export function useWorkout() { return useContext(WorkoutContext); }

// app/_layout.tsx
<AuthProvider>
  <WorkoutProvider>
    <Slot />
  </WorkoutProvider>
</AuthProvider>
```

### 8.5 폼 만들기 패턴

이 프로젝트는 `react-hook-form` + `zod`를 사용한다.

```
1. lib/validations/에 zod 스키마 정의
2. useForm({ resolver: zodResolver(schema) })
3. Controller로 각 Input 감싸기
4. handleSubmit(onSubmit)으로 제출
```

### 8.6 주요 사용 라이브러리

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
