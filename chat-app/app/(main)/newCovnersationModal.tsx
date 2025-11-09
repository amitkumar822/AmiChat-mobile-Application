import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import * as Icons from "phosphor-react-native";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import * as ImagePicker from "expo-image-picker";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/contexts/authContext";
import Button from "@/components/Button";
import { verticalScale } from "@/utils/styling";
import { getContacts, newConversation } from "@/socket/socketEvents";
import { uploadFileToCloudinary } from "@/services/imageService";

const NewCovnersationModal = () => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup === "1";
  const router = useRouter();
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<any[]>([]);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    getContacts(processGetContacts);
    newConversation(processNewConversation);
    getContacts(null);

    return () => {
      getContacts(processGetContacts, false);
      newConversation(processNewConversation, false);
    };
  }, []);

  const processGetContacts = (res: any) => {
    if (res.success) {
      setContacts(res.data);
    }
  };
  const processNewConversation = (res: any) => {
    // console.log("new conversation response: ", JSON.stringify(res, null, 2));
    setIsLoading(false);
    if (res.success) {
      router.back();
      router.push({
        pathname: "/(main)/conversation",
        params: {
          id: res.data._id,
          name: res.data.name,
          avatar: res.data.avatar,
          type: res.data.type,
          participants: JSON.stringify(res.data.participants),
        },
      });
    } else {
      // console.log("Error fetching/creating conversation: ", res.msg);
      Alert.alert("Error", res.msg);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setGroupAvatar(result?.assets?.[0]);
    }
  };

  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev: any) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id !== user.id);
      }
      return [...prev, user.id];
    });
  };

  const onSelectUser = (user: any) => {
    // console.log("onSelectUser: ", user);
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please login to continue");
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      newConversation({
        type: "direct",
        participants: [currentUser.id, user.id],
      });
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length < 2 || !currentUser || !groupAvatar) {
      Alert.alert("Group Creation", "Group name is required, at least 2 participants are required and a group avatar is required");
      return;
    }

    setIsLoading(true);
    try {
      let avatar = null;
      if (groupAvatar) {
        const uploadResult = await uploadFileToCloudinary(
          groupAvatar,
          "group-avatars"
        );

        if (uploadResult.success) {
          avatar = uploadResult.data;
        }

        newConversation({
          type: "group",
          participants: [currentUser.id, ...selectedParticipants],
          name: groupName,
          avatar,
        });
      }
    } catch (error: any) {
      console.error("Error creating group: ", error);
      Alert.alert("Error", error.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={isGroupMode ? "New Group" : "Select User"}
          leftIcon={<BackButton color={colors.black} />}
        />

        {isGroupMode && (
          <View style={styles.groupModeContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage}>
                <Avatar
                  uri={groupAvatar?.uri || null}
                  size={100}
                  isGroup={true}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.groupNameContainer}>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactList}
        >
          {contacts.map((user: any, index: number) => {
            const isSelected = selectedParticipants.includes(user.id);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactRow,
                  isSelected && styles.selectedContact,
                ]}
                onPress={() => onSelectUser(user)}
              >
                <Avatar uri={user.avatar} size={45} />
                <Typo fontWeight={"500"}>{user.name}</Typo>

                {isGroupMode && (
                  <View style={styles.selectionIndicator}>
                    <View
                      style={[styles.checkbox, isSelected && styles.checked]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isGroupMode && selectedParticipants.length >= 2 && (
          <View style={styles.createGroupButton}>
            <Button
              onPress={createGroup}
              loading={isLoading}
              disabled={!groupName.trim()}
            >
              <Typo size={17} fontWeight={"bold"}>
                Create Group
              </Typo>
            </Button>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewCovnersationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: spacingX._15,
  },
  groupModeContainer: {
    alignItems: "center",
    marginTop: spacingY._10,
  },
  avatarContainer: {
    marginBottom: spacingY._10,
  },
  groupNameContainer: {
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },
  selectedContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },
  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._10,
    paddingTop: spacingY._10,
    paddingBottom: verticalScale(150),
  },
  selectionIndicator: {
    marginLeft: "auto",
    marginRight: spacingX._10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  createGroupButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
