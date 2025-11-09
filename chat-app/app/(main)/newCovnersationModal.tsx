import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
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

const NewCovnersationModal = () => {
  const { isGroup } = useLocalSearchParams();
  console.log("isGroup: ", isGroup);
  const isGroupMode = isGroup === "1";
  const router = useRouter();
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user: currentUser } = useAuth();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setGroupAvatar(result?.assets?.[0]);
    }
  };

  const contacts = [
    {
      id: "1",
      name: "John Doe",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      id: "2",
      name: "Jane Doe",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: "3",
      name: "Jim Doe",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    {
      id: "4",
      name: "Jill Doe",
      avatar: "https://randomuser.me/api/portraits/women/31.jpg",
    },
    {
      id: "5",
      name: "Jack Doe",
      avatar: "https://randomuser.me/api/portraits/men/72.jpg",
    },
    {
      id: "6",
      name: "Jill Doe",
      avatar: "https://randomuser.me/api/portraits/women/52.jpg",
    },
    {
      id: "7",
      name: "Jack Doe",
      avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    },
    {
      id: "8",
      name: "Jill Doe",
      avatar: "https://randomuser.me/api/portraits/women/74.jpg",
    },
    {
      id: "9",
      name: "Jack Doe",
      avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    },
    {
      id: "10",
      name: "Jill Doe",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    },
  ];

  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev: any) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id !== user.id);
      }
      return [...prev, user.id];
    });
  };

  const onSelectUser = (user: any) => {
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please login to continue");
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      // TODO: Implement direct conversation creation
    }
  };

  const createGroup = async () => {
    if(!groupName.trim() || selectedParticipants.length < 2 || !currentUser) return;

    // TODO: Implement group creation
  }

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
                  styles.contactRow, isSelected && styles.selectedContact,
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

        {
            isGroupMode && selectedParticipants.length >= 2 && (
                <View style={styles.createGroupButton}>
                    <Button onPress={createGroup} loading={isLoading} disabled={!groupName.trim()}>
                        <Typo size={17} fontWeight={"bold"}>Create Group</Typo>
                    </Button>
                </View>
            )
        }
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
