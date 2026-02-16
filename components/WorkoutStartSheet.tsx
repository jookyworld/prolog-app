import { routineApi } from "@/lib/api/routine";
import { COLORS } from "@/lib/constants";
import type { RoutineListItem } from "@/lib/types/routine";
import { useRouter } from "expo-router";
import { AlertCircle, Dumbbell, LayoutGrid, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface WorkoutStartSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function WorkoutStartSheet({
  visible,
  onClose,
}: WorkoutStartSheetProps) {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const fetchActiveRoutines = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const all = await routineApi.getRoutines();
      setRoutines(all.filter((r) => r.active));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchActiveRoutines();
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 28,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim, fetchActiveRoutines]);

  const handleSelectRoutine = (id: number) => {
    onClose();
    router.push(`/(tabs)/workout/session?routineId=${id}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          opacity: backdropAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: SCREEN_HEIGHT * 0.85,
          backgroundColor: COLORS.card,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Handle bar */}
        <View className="items-center pb-2 pt-4">
          <View className="h-1.5 w-10 rounded-full bg-white/20" />
        </View>

        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center justify-between px-6">
          <Text className="text-2xl font-bold text-white">
            어떤 운동을 할까요?
          </Text>
          <Pressable
            onPress={onClose}
            className="rounded-xl p-2 active:bg-white/5"
          >
            <X size={20} color={COLORS.mutedForeground} />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          className="px-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text className="mt-3 text-sm text-white/50">
                루틴 불러오는 중...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center py-10">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle size={24} color={COLORS.destructive} />
              </View>
              <Text className="mb-1 text-base font-semibold text-white/60">
                불러오기 실패
              </Text>
              <Text className="mb-4 text-sm text-white/40">
                네트워크 연결을 확인해주세요
              </Text>
              <Pressable
                onPress={fetchActiveRoutines}
                className="rounded-xl bg-white/5 px-5 py-2.5 active:opacity-80"
              >
                <Text className="text-sm font-medium text-white/70">
                  다시 시도
                </Text>
              </Pressable>
            </View>
          ) : routines.length === 0 ? (
            <View className="items-center py-10">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <LayoutGrid size={24} color={COLORS.iconMuted} />
              </View>
              <Text className="mb-1 text-base font-semibold text-white/60">
                활성 루틴이 없어요
              </Text>
              <Text className="mb-4 text-sm text-white/40">
                루틴 탭에서 루틴을 추가해보세요
              </Text>
              <Pressable
                onPress={() => {
                  onClose();
                  router.push("/(tabs)/routine");
                }}
                className="rounded-xl bg-white/5 px-5 py-2.5 active:opacity-80"
              >
                <Text className="text-sm font-medium text-white/70">
                  루틴 보러가기
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-3">
              {routines.map((routine) => (
                <View
                  key={routine.id}
                  className="flex-row items-center gap-4 rounded-2xl bg-background p-4"
                >
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Dumbbell size={22} color={COLORS.primary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="mb-0.5 text-base font-bold text-white"
                      numberOfLines={1}
                    >
                      {routine.title}
                    </Text>
                    {routine.description ? (
                      <Text className="text-sm text-white/50" numberOfLines={1}>
                        {routine.description}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => handleSelectRoutine(routine.id)}
                    className="rounded-xl bg-primary px-5 py-2.5 active:opacity-80"
                  >
                    <Text className="text-sm font-semibold text-white">
                      시작
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}
