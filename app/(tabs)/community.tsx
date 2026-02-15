import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-bold text-white">커뮤니티</Text>
      </View>
    </SafeAreaView>
  );
}
