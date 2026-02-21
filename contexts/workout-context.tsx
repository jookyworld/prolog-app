import { createContext, useCallback, useContext, useState } from "react";

interface ActiveSession {
  sessionId: number;
  routineId: number | null;
}

interface WorkoutContextValue {
  activeSession: ActiveSession | null;
  startWorkout: (sessionId: number, routineId: number | null) => void;
  endWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );

  const startWorkout = useCallback((sessionId: number, routineId: number | null) => {
    setActiveSession({ sessionId, routineId });
  }, []);

  const endWorkout = useCallback(() => {
    setActiveSession(null);
  }, []);

  return (
    <WorkoutContext.Provider
      value={{ activeSession, startWorkout, endWorkout }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
