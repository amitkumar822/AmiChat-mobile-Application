import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { scale, verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import * as Icons from "phosphor-react-native";
import MessageItem from "@/components/MessageItem";
import Input from "@/components/Input";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Loading from "@/components/Loading";
import { uploadFileToCloudinary } from "@/services/imageService";

const Conversation = () => {
  const { user: currentUser } = useAuth();
  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ uri: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const participants = JSON.parse(stringifiedParticipants as string);

  let conversationAvatar = avatar;
  let isDirect = type === "direct";
  const otherParticipant = isDirect
    ? participants.find(
      (participant: any) => participant._id !== currentUser?.id
    )
    : null;

  if (isDirect && otherParticipant) {
    conversationAvatar = otherParticipant?.avatar;
  }

  let conversationName = isDirect ? otherParticipant?.name : name;

  const dummyMessages = [
    {
      id: "msg_50",
      sender: { id: "user_2", name: "Jane Smith", avatar: null },
      content: "That would be really useful!",
      createdAt: "10:42 AM",
      isMe: false,
    },
    {
      id: "msg_49",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Yes, I'm thinking about adding reactions and file sharing.",
      createdAt: "10:41 AM",
      isMe: true,
    },
    {
      id: "msg_48",
      sender: { id: "user_1", name: "John Doe", avatar: null },
      content: "Are you planning to add any special features?",
      createdAt: "10:40 AM",
      isMe: false,
    },
    {
      id: "msg_47",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Thanks! I'm trying to make it as user-friendly as possible.",
      createdAt: "10:38 AM",
      isMe: true,
    },
    {
      id: "msg_46",
      sender: { id: "user_3", name: "Emily Chen", avatar: null },
      content: "The interface looks really clean!",
      createdAt: "10:36 AM",
      isMe: false,
    },
    {
      id: "msg_45",
      sender: { id: "me", name: "Me", avatar: null },
      content: "App performance is pretty stable on mid-range devices too.",
      createdAt: "10:34 AM",
      isMe: true,
    },
    {
      id: "msg_44",
      sender: { id: "user_4", name: "Carlos Alvarez", avatar: null },
      content: "Have you tested it on older phones?",
      createdAt: "10:32 AM",
      isMe: false,
    },
    {
      id: "msg_43",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Notifications are on the roadmap for the next sprint.",
      createdAt: "10:30 AM",
      isMe: true,
    },
    {
      id: "msg_42",
      sender: { id: "user_5", name: "Priya Patel", avatar: null },
      content: "Will we get push notifications soon?",
      createdAt: "10:28 AM",
      isMe: false,
    },
    {
      id: "msg_41",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Yes, you'll be able to archive chats individually.",
      createdAt: "10:26 AM",
      isMe: true,
    },
    {
      id: "msg_40",
      sender: { id: "user_6", name: "Liam Nguyen", avatar: null },
      content: "Is there an option to archive chats?",
      createdAt: "10:24 AM",
      isMe: false,
    },
    {
      id: "msg_39",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Dark mode adapts to your system preferences automatically.",
      createdAt: "10:22 AM",
      isMe: true,
    },
    {
      id: "msg_38",
      sender: { id: "user_7", name: "Sophia Rossi", avatar: null },
      content: "The dark mode is really easy on the eyes!",
      createdAt: "10:20 AM",
      isMe: false,
    },
    {
      id: "msg_37",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Yeah, the onboarding flow is almost ready.",
      createdAt: "10:18 AM",
      isMe: true,
    },
    {
      id: "msg_36",
      sender: { id: "user_8", name: "Noah Kim", avatar: null },
      content: "Do you have a demo walkthrough prepared?",
      createdAt: "10:16 AM",
      isMe: false,
    },
    {
      id: "msg_35",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Sure, I'll share the invite after this call.",
      createdAt: "10:14 AM",
      isMe: true,
    },
    {
      id: "msg_34",
      sender: { id: "user_9", name: "Ava Thompson", avatar: null },
      content: "Can I invite a friend to help test it?",
      createdAt: "10:12 AM",
      isMe: false,
    },
    {
      id: "msg_33",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Stickers are coming right after we finalize the emoji picker.",
      createdAt: "10:10 AM",
      isMe: true,
    },
    {
      id: "msg_32",
      sender: { id: "user_10", name: "Oliver Martin", avatar: null },
      content: "Will we get sticker packs later on?",
      createdAt: "10:08 AM",
      isMe: false,
    },
    {
      id: "msg_31",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Pinned conversations are supported in this build.",
      createdAt: "10:06 AM",
      isMe: true,
    },
    {
      id: "msg_30",
      sender: { id: "user_11", name: "Mia Hernandez", avatar: null },
      content: "Are pinned chats part of the MVP?",
      createdAt: "10:04 AM",
      isMe: false,
    },
    {
      id: "msg_29",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Group admins can now remove members directly from the chat.",
      createdAt: "10:02 AM",
      isMe: true,
    },
    {
      id: "msg_28",
      sender: { id: "user_12", name: "Lucas Brown", avatar: null },
      content: "Nice! Can group admins manage members easily?",
      createdAt: "10:00 AM",
      isMe: false,
    },
    {
      id: "msg_27",
      sender: { id: "me", name: "Me", avatar: null },
      content: "We also added read receipts for group chats.",
      createdAt: "9:58 AM",
      isMe: true,
    },
    {
      id: "msg_26",
      sender: { id: "user_13", name: "Isabella Garcia", avatar: null },
      content: "Any updates on group chat features?",
      createdAt: "9:56 AM",
      isMe: false,
    },
    {
      id: "msg_25",
      sender: { id: "me", name: "Me", avatar: null },
      content: "I fixed the bug that caused duplicate notifications.",
      createdAt: "9:54 AM",
      isMe: true,
    },
    {
      id: "msg_24",
      sender: { id: "user_14", name: "Ethan Wilson", avatar: null },
      content: "Great! That was the most annoying issue.",
      createdAt: "9:52 AM",
      isMe: false,
    },
    {
      id: "msg_23",
      sender: { id: "me", name: "Me", avatar: null },
      content: "We're beta testing the desktop client next month.",
      createdAt: "9:50 AM",
      isMe: true,
    },
    {
      id: "msg_22",
      sender: { id: "user_15", name: "Harper Davis", avatar: null },
      content: "Are you building a desktop companion app?",
      createdAt: "9:48 AM",
      isMe: false,
    },
    {
      id: "msg_21",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Yep, video calling is on our stretch goal list.",
      createdAt: "9:46 AM",
      isMe: true,
    },
    {
      id: "msg_20",
      sender: { id: "user_16", name: "Amelia Scott", avatar: null },
      content: "Do you plan to add video calls eventually?",
      createdAt: "9:44 AM",
      isMe: false,
    },
    {
      id: "msg_19",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Custom themes will ship after we polish the editor.",
      createdAt: "9:42 AM",
      isMe: true,
    },
    {
      id: "msg_18",
      sender: { id: "user_17", name: "James Lee", avatar: null },
      content: "Will there be a way to customize the theme colors?",
      createdAt: "9:40 AM",
      isMe: false,
    },
    {
      id: "msg_17",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Messages now sync across devices in under two seconds.",
      createdAt: "9:38 AM",
      isMe: true,
    },
    {
      id: "msg_16",
      sender: { id: "user_18", name: "Charlotte Green", avatar: null },
      content: "How fast is the message sync between devices?",
      createdAt: "9:36 AM",
      isMe: false,
    },
    {
      id: "msg_15",
      sender: { id: "me", name: "Me", avatar: null },
      content: "We introduced message search with keyword highlighting.",
      createdAt: "9:34 AM",
      isMe: true,
    },
    {
      id: "msg_14",
      sender: { id: "user_19", name: "Daniel Evans", avatar: null },
      content: "Is the search function live now?",
      createdAt: "9:32 AM",
      isMe: false,
    },
    {
      id: "msg_13",
      sender: { id: "me", name: "Me", avatar: null },
      content: "You can now schedule messages for later delivery.",
      createdAt: "9:30 AM",
      isMe: true,
    },
    {
      id: "msg_12",
      sender: { id: "user_20", name: "Grace Walker", avatar: null },
      content: "That's awesome! I needed scheduled messages.",
      createdAt: "9:28 AM",
      isMe: false,
    },
    {
      id: "msg_11",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Backups run every night and store encrypted copies.",
      createdAt: "9:26 AM",
      isMe: true,
    },
    {
      id: "msg_10",
      sender: { id: "user_21", name: "Henry Carter", avatar: null },
      content: "How often are chat backups taken?",
      createdAt: "9:24 AM",
      isMe: false,
    },
    {
      id: "msg_09",
      sender: { id: "me", name: "Me", avatar: null },
      content: "The beta release is scheduled for the end of the week.",
      createdAt: "9:22 AM",
      isMe: true,
    },
    {
      id: "msg_08",
      sender: { id: "user_22", name: "Elijah Moore", avatar: null },
      content: "When can we expect the first beta?",
      createdAt: "9:20 AM",
      isMe: false,
    },
    {
      id: "msg_07",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Yep, the chat history loads instantly now.",
      createdAt: "9:18 AM",
      isMe: true,
    },
    {
      id: "msg_06",
      sender: { id: "user_23", name: "Aria Lopez", avatar: null },
      content: "Did you optimize the initial loading time?",
      createdAt: "9:16 AM",
      isMe: false,
    },
    {
      id: "msg_05",
      sender: { id: "me", name: "Me", avatar: null },
      content: "We now support offline messaging with queued delivery.",
      createdAt: "9:14 AM",
      isMe: true,
    },
    {
      id: "msg_04",
      sender: { id: "user_24", name: "Zoe Ramirez", avatar: null },
      content: "Offline messaging sounds great!",
      createdAt: "9:12 AM",
      isMe: false,
    },
    {
      id: "msg_03",
      sender: { id: "me", name: "Me", avatar: null },
      content: "We hardened the encryption layer with rotating keys.",
      createdAt: "9:10 AM",
      isMe: true,
    },
    {
      id: "msg_02",
      sender: { id: "user_25", name: "Logan Baker", avatar: null },
      content: "Security improvements are always welcome.",
      createdAt: "9:08 AM",
      isMe: false,
    },
    {
      id: "msg_01",
      sender: { id: "me", name: "Me", avatar: null },
      content: "Morning! Just pushed the latest build to staging.",
      createdAt: "9:06 AM",
      isMe: true,
    },
  ];

  const onPickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedFile(result?.assets?.[0] as any);
    }
  };

  const onSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    if (!currentUser) return;

    setLoading(true);
    try {
      let attachment = null;
      if (selectedFile) {
        const uploadResult = await uploadFileToCloudinary(
          selectedFile,
          "message-attachments"
        );

        if (uploadResult.success) {
          attachment = uploadResult.data;
        } else {
          setLoading(false);
          Alert.alert("Error", "Failed to upload file");
        }
      }

      console.log("attachment", attachment);
    } catch (error) {
      console.log("Error sending message", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <Header
          style={styles.header}
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                uri={conversationAvatar as string}
                size={40}
                isGroup={type === "group"}
              />
              <Typo size={22} fontWeight="500" color={colors.white}>
                {conversationName}
              </Typo>
            </View>
          }
          rightIcon={
            <TouchableOpacity style={{ marginBottom: verticalScale(7) }}>
              <Icons.DotsThreeOutlineVerticalIcon
                weight="fill"
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />

        {/* message */}
        <View style={styles.content}>
          <FlatList
            data={dummyMessages}
            inverted={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageContent}
            renderItem={({ item }) => (
              <MessageItem item={item} isDirect={isDirect} />
            )}
            keyExtractor={(item) => item.id}
          />

          <View style={styles.footer}>
            <Input
              value={message}
              onChangeText={setMessage}
              containerStyle={{
                paddingLeft: spacingX._10,
                paddingRight: scale(65),
                borderWidth: 0,
              }}
              placeholder="Type a message..."
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  <Icons.PlusIcon
                    weight="bold"
                    color={colors.black}
                    size={verticalScale(22)}
                  />

                  {selectedFile && selectedFile.uri && (
                    <Image
                      source={selectedFile.uri}
                      style={styles.selectedFile}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <View style={styles.inputRightIcon}>
              <TouchableOpacity
                style={styles.inputIcon}
                onPress={onSendMessage}
              >
                {loading ? (
                  <Loading size="small" color={colors.black} />
                ) : (
                  <Icons.PaperPlaneTiltIcon
                    weight="fill"
                    color={colors.black}
                    size={verticalScale(22)}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  inputRightIcon: {
    position: "absolute",
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  selectedFile: {
    position: "absolute",
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignSelf: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15,
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  messagesContainer: {
    flex: 1,
  },
  messageContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12,
  },
  plusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
});
