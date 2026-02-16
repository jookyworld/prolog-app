import CustomTabBar from "@/components/CustomTabBar";
import WorkoutStartSheet from "@/components/WorkoutStartSheet";
import { useWorkout } from "@/contexts/workout-context";
import { Tabs, useRouter } from "expo-router";
import { Home, LayoutGrid, User, Users } from "lucide-react-native";
import { useState } from "react";

export default function TabsLayout() {
  const router = useRouter();
  const { activeSession } = useWorkout();
  const [sheetVisible, setSheetVisible] = useState(false);

  const handlePressFAB = () => {
    if (activeSession) {
      router.push(
        `/(tabs)/workout/session?routineId=${activeSession.routineId}`,
      );
    } else {
      setSheetVisible(true);
    }
  };

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} onPressFAB={handlePressFAB} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "홈",
            tabBarIcon: ({ color }) => <Home size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="routine"
          options={{
            title: "루틴",
            tabBarIcon: ({ color }) => <LayoutGrid size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "커뮤니티",
            tabBarIcon: ({ color }) => <Users size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "내 정보",
            tabBarIcon: ({ color }) => <User size={26} color={color} />,
          }}
        />
      </Tabs>

      <WorkoutStartSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}
