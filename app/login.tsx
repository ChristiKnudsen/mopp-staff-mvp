import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>MOPP Staff</Text>

      <Text style={{ fontSize: 16, opacity: 0.7 }}>
        Log in to choose shifts and set availability
      </Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
        }}
      />

      <Pressable
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          alignItems: "center",
        }}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Log in</Text>
      </Pressable>
    </View>
  );
}
