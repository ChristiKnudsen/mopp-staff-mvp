import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type StaffStatus = "AVAILABLE" | "STANDBY" | "HOLIDAY";

type StaffMember = {
  id: string;
  name: string;
  status: StaffStatus;
  photoUri?: string;
};

const STORAGE_KEY = "mopp_staff_v1";

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
  const [staff, setStaff] = useState<StaffMember[]>(START_STAFF);

  // Add/Edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftStatus, setDraftStatus] = useState<StaffStatus>("AVAILABLE");
  const [draftPhotoUri, setDraftPhotoUri] = useState<string | undefined>(
    undefined,
  );

  const isEditing = editingId !== null;

  const modalTitle = useMemo(
    () => (isEditing ? "Edit employee" : "Add employee"),
    [isEditing],
  );

  // 1) LOAD staff from phone storage when screen starts
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as StaffMember[];
        if (Array.isArray(saved) && saved.length > 0) {
          setStaff(saved);
        }
      } catch (e) {
        // If storage is broken, we just keep defaults
        console.log("Failed to load staff:", e);
      }
    })();
  }, []);

  // 2) SAVE staff to phone storage whenever it changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
      } catch (e) {
        console.log("Failed to save staff:", e);
      }
    })();
  }, [staff]);

  function openAdd() {
    setEditingId(null);
    setDraftName("");
    setDraftStatus("AVAILABLE");
    setDraftPhotoUri(undefined);
    setModalVisible(true);
  }

  function openEdit(member: StaffMember) {
    setEditingId(member.id);
    setDraftName(member.name);
    setDraftStatus(member.status);
    setDraftPhotoUri(member.photoUri);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
  }

  function saveEmployee() {
    const name = draftName.trim();
    if (!name) {
      Alert.alert("Name missing", "Please write a name.");
      return;
    }

    if (isEditing && editingId) {
      setStaff((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, name, status: draftStatus, photoUri: draftPhotoUri }
            : m,
        ),
      );
      closeModal();
      return;
    }

    const newMember: StaffMember = {
      id: String(Date.now()),
      name,
      status: draftStatus,
      photoUri: draftPhotoUri,
    };

    setStaff((prev) => [newMember, ...prev]);
    closeModal();
  }

  function deleteEmployee(id: string) {
    Alert.alert("Delete employee?", "This will remove them from the list.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setStaff((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (uri) setDraftPhotoUri(uri);
  }

  // Optional: a reset button if you ever want to go back to default
  async function resetToDefault() {
    Alert.alert("Reset staff list?", "This will restore the default list.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setStaff(START_STAFF);
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 24 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: "700" }}>Staff</Text>
          <Text style={{ marginTop: 6, fontSize: 16, opacity: 0.7 }}>
            Add, edit, and manage availability
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={resetToDefault}
            style={{
              borderWidth: 1,
              borderRadius: 999,
              paddingVertical: 10,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Reset</Text>
          </Pressable>

          <Pressable
            onPress={openAdd}
            style={{
              borderWidth: 1,
              borderRadius: 999,
              paddingVertical: 10,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
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
            onPress={() => openEdit(item)}
            onLongPress={() => deleteEmployee(item.id)}
          >
            {item.photoUri ? (
              <Image
                source={{ uri: item.photoUri }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: 1,
                }}
              />
            ) : (
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
            )}

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

                <Text style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
                  Tap to edit • Hold to delete
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Add/Edit modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 16,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800" }}>
              {modalTitle}
            </Text>

            <Text style={{ marginTop: 10, fontWeight: "700" }}>Name</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Employee name"
              style={{
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                marginTop: 8,
              }}
            />

            <Text style={{ marginTop: 12, fontWeight: "700" }}>Status</Text>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 12,
                marginTop: 8,
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={draftStatus}
                onValueChange={(value) => setDraftStatus(value)}
              >
                <Picker.Item label="Available" value="AVAILABLE" />
                <Picker.Item label="Standby" value="STANDBY" />
                <Picker.Item label="Holiday" value="HOLIDAY" />
              </Picker>
            </View>

            <Text style={{ marginTop: 12, fontWeight: "700" }}>Photo</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              {draftPhotoUri ? (
                <Image
                  source={{ uri: draftPhotoUri }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 1,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>?</Text>
                </View>
              )}

              <Pressable
                onPress={pickPhoto}
                style={{
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ fontWeight: "800" }}>Choose photo</Text>
              </Pressable>

              {draftPhotoUri ? (
                <Pressable
                  onPress={() => setDraftPhotoUri(undefined)}
                  style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>Remove</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <Pressable
                onPress={closeModal}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={saveEmployee}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800" }}>
                  {isEditing ? "Save" : "Add"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
