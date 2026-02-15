import { routineApi } from "@/lib/api/routine";
import { COLORS } from "@/lib/constants";
import type { RoutineListItem } from "@/lib/types/routine";
import { Dumbbell, LayoutGrid, X } from "lucide-react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WorkoutScreen() {
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const fetchActiveRoutines = useCallback(async () => {
    setLoading(true);
    try {
      const all = await routineApi.getRoutines();
      setRoutines(all.filter((r) => r.active));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Show bottom sheet when tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchActiveRoutines();
      setSheetVisible(true);
    }, [fetchActiveRoutines]),
  );

  // Animate in/out
  useEffect(() => {
    if (sheetVisible) {
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
  }, [sheetVisible, slideAnim, backdropAnim]);

  const closeSheet = () => setSheetVisible(false);
  const openSheet = () => {
    fetchActiveRoutines();
    setSheetVisible(true);
  };

  const handleSelectRoutine = (id: number) => {
    closeSheet();
    router.push(`/(tabs)/workout/session?routineId=${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Background content */}
      <View className="px-5 py-4">
        <Text className="text-2xl font-bold text-white">운동</Text>
      </View>

      <View className="flex-1 items-center justify-center px-5">
        <View className="w-full rounded-2xl bg-card p-6">
          <View className="mb-4 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-primary/15">
              <Dumbbell size={28} color={COLORS.primary} />
            </View>
            <Text className="mb-1 text-lg font-bold text-white">
              루틴으로 운동 시작
            </Text>
            <Text className="text-center text-sm text-white/50">
              아래 버튼을 눌러 활성 루틴을 선택하고{"\n"}운동을 시작해보세요
            </Text>
          </View>
          <Pressable
            onPress={openSheet}
            className="items-center rounded-xl bg-primary py-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-white">
              루틴 선택하기
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        {/* Backdrop */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            opacity: backdropAnim,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeSheet} />
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
              onPress={closeSheet}
              className="rounded-xl p-2 active:bg-white/5"
            >
              <X size={20} color="rgba(255,255,255,0.6)" />
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
            ) : routines.length === 0 ? (
              <View className="items-center py-10">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  <LayoutGrid size={24} color="rgba(255,255,255,0.3)" />
                </View>
                <Text className="mb-1 text-base font-semibold text-white/60">
                  활성 루틴이 없어요
                </Text>
                <Text className="mb-4 text-sm text-white/40">
                  루틴 탭에서 루틴을 추가해보세요
                </Text>
                <Pressable
                  onPress={() => {
                    closeSheet();
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
                    {/* Icon */}
                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Dumbbell size={22} color={COLORS.primary} />
                    </View>

                    {/* Info */}
                    <View className="min-w-0 flex-1">
                      <Text
                        className="mb-0.5 text-base font-bold text-white"
                        numberOfLines={1}
                      >
                        {routine.title}
                      </Text>
                      {routine.description ? (
                        <Text
                          className="text-sm text-white/50"
                          numberOfLines={1}
                        >
                          {routine.description}
                        </Text>
                      ) : null}
                    </View>

                    {/* Start button */}
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
    </SafeAreaView>
  );
}
