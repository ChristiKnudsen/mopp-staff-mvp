import { useActionSheet } from "@expo/react-native-action-sheet";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type StaffStatus = "AVAILABLE" | "STANDBY" | "HOLIDAY";

type StaffMember = {
  id: string;
  name: string;
  status: StaffStatus;
};

const START_STAFF: StaffMember[] = [
  { id: "1", name: "Mouna", status: "AVAILABLE" },
  { id: "2", name: "Fatima", status: "STANDBY" },
  { id: "3", name: "Jonas", status: "HOLIDAY" },
  { id: "4", name: "Linda", status: "AVAILABLE" },
];

function initials(name: string) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function statusLabel(status: StaffStatus) {
  if (status === "AVAILABLE") return "Available";
  if (status === "STANDBY") return "Standby";
  return "Holiday";
}

export default function StaffWallScreen() {
  const { showActionSheetWithOptions } = useActionSheet();
  const [staff, setStaff] = useState<StaffMember[]>(START_STAFF);

  function setStatus(id: string, status: StaffStatus) {
    setStaff((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  function openStatusMenu(member: StaffMember) {
    const options = ["Available", "Standby", "Holiday", "Cancel"];
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        title: `Set status for ${member.name}`,
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) setStatus(member.id, "AVAILABLE");
        if (selectedIndex === 1) setStatus(member.id, "STANDBY");
        if (selectedIndex === 2) setStatus(member.id, "HOLIDAY");
      },
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Staff</Text>
      <Text style={{ marginTop: 6, fontSize: 16, opacity: 0.7 }}>
        Tap a person to choose their status
      </Text>

      <FlatList
        style={{ marginTop: 16 }}
        data={staff}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={{
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
            onPress={() => openStatusMenu(item)}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                {initials(item.name)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "600" }}>
                {item.name}
              </Text>

              <View style={{ marginTop: 6, flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600" }}>
                    {statusLabel(item.status)}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
