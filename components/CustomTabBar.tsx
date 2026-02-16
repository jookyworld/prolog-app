import { COLORS } from "@/lib/constants";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Dumbbell } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

const FAB_SIZE = 50;
const TAB_BAR_HEIGHT = 50;
const HIDDEN_TABS = ["workout"];

interface CustomTabBarProps extends BottomTabBarProps {
  onPressFAB: () => void;
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  insets,
  onPressFAB,
}: CustomTabBarProps) {
  const visibleRoutes = state.routes.filter(
    (route) => !HIDDEN_TABS.includes(route.name),
  );

  const leftTabs = visibleRoutes.slice(0, 2);
  const rightTabs = visibleRoutes.slice(2);

  const renderTab = (route: (typeof visibleRoutes)[number]) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.indexOf(route);

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const color = isFocused ? COLORS.white : COLORS.tabInactive;
    const icon =
      options.tabBarIcon?.({ focused: isFocused, color, size: 22 }) ?? null;
    const label =
      typeof options.tabBarLabel === "string"
        ? options.tabBarLabel
        : typeof options.title === "string"
          ? options.title
          : route.name;

    return (
      <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
        {icon}
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      {/* FAB */}
      <View style={styles.fabWrapper} pointerEvents="box-none">
        <Pressable onPress={onPressFAB} style={styles.fabTouchArea}>
          <View style={styles.fab}>
            <Dumbbell size={26} color={COLORS.white} />
          </View>
          <Text style={styles.fabLabel}>운동</Text>
        </Pressable>
      </View>

      {/* 탭 행 */}
      <View style={styles.tabRow}>
        {leftTabs.map(renderTab)}
        <View style={styles.spacer} />
        {rightTabs.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "visible",
  },
  fabWrapper: {
    position: "absolute",
    top: -(FAB_SIZE / 4),
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  fabTouchArea: {
    alignItems: "center",
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.tabInactive,
    marginTop: 6,
  },
  tabRow: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  spacer: {
    flex: 1,
  },
});
