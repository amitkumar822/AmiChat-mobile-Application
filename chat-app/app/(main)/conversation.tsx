import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  getMessage,
  messageDelivered,
  messageRead,
  messageStatusUpdated,
  newMessage,
  typing,
} from "@/socket/socketEvents";
import { MessageProps, ResponseProps } from "@/types";

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
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [typingUser, setTypingUser] = useState<{ id: string; name: string } | null>(
    null
  );

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const conversationIdParam = useMemo(() => {
    if (Array.isArray(conversationId)) {
      return conversationId[0] as string;
    }
    return (conversationId as string) || "";
  }, [conversationId]);

  const participants = useMemo(() => {
    if (!stringifiedParticipants) return [];
    try {
      if (Array.isArray(stringifiedParticipants)) {
        return JSON.parse(stringifiedParticipants[0] as string);
      }
      return JSON.parse(stringifiedParticipants as string);
    } catch (error) {
      console.warn("Failed to parse participants", error);
      return [];
    }
  }, [stringifiedParticipants]);

  const participantIds = useMemo(
    () => participants.map((participant: any) => participant._id),
    [participants]
  );

  const normalizeMessage = useCallback(
    (message: any): MessageProps => {
      const deliveredTo =
        (message?.deliveredTo || []).map((id: any) => id.toString?.() || id) ??
        [];
      const readBy =
        (message?.readBy || []).map((id: any) => id.toString?.() || id) ?? [];

      return {
        id:
          message?.id?.toString?.() ||
          message?._id?.toString?.() ||
          message?._id ||
          message?.id,
        content: message?.content || "",
        sender: message?.sender || {
          id: message?.senderId?._id || message?.senderId,
          name: message?.senderId?.name || "",
          avatar: message?.senderId?.avatar || null,
        },
        attachment: message?.attachment || message?.attachement || null,
        createdAt: message?.createdAt,
        conversationId:
          message?.conversationId?.toString?.() ||
          message?.conversationId ||
          conversationIdParam,
        deliveredTo,
        readBy,
      };
    },
    [conversationIdParam]
  );

  const acknowledgeDelivery = useCallback(
    (messageList: MessageProps[]) => {
      if (!currentUser?.id) return;
      const userId = currentUser.id;
      if (!userId) return;
      messageList.forEach((msg) => {
        if (msg.sender.id === userId) return;
        if (msg.deliveredTo?.includes(userId)) return;
        messageDelivered({
          messageId: msg.id,
          conversationId: conversationIdParam,
        });
      });
    },
    [conversationIdParam, currentUser?.id]
  );

  const acknowledgeRead = useCallback(
    (messageList: MessageProps[]) => {
      if (!currentUser?.id) return;
      const userId = currentUser.id;
      if (!userId) return;
      const unreadIds = messageList
        .filter(
          (msg) =>
            msg.sender.id !== userId &&
            !(msg.readBy || []).includes(userId)
        )
        .map((msg) => msg.id);

      if (unreadIds.length) {
        messageRead({
          conversationId: conversationIdParam,
          messageIds: unreadIds,
        });
      }
    },
    [conversationIdParam, currentUser?.id]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationIdParam) return;
      if (isTypingRef.current === isTyping) return;

      typing({
        conversationId: conversationIdParam,
        isTyping,
      });
      isTypingRef.current = isTyping;
    },
    [conversationIdParam]
  );

  const handleTypingChange = useCallback(
    (text: string) => {
      setMessage(text);

      if (!conversationIdParam) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const hasText = text.trim().length > 0;

      if (hasText) {
        emitTyping(true);
        typingTimeoutRef.current = setTimeout(() => {
          emitTyping(false);
        }, 2000);
      } else {
        emitTyping(false);
      }
    },
    [conversationIdParam, emitTyping]
  );

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

  const messageStatusHandler = useCallback(
    (res: ResponseProps) => {
      if (!res.success || !res.data) return;
      if (res.data.conversationId !== conversationIdParam) return;

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === res.data.messageId
            ? {
                ...msg,
                deliveredTo: res.data.deliveredTo || [],
                readBy: res.data.readBy || [],
              }
            : msg
        )
      );
    },
    [conversationIdParam]
  );

  const typingHandler = useCallback(
    (data: any) => {
      if (!data?.conversationId || data.conversationId !== conversationIdParam)
        return;
      if (!data.user || data.user.id === currentUser?.id) return;

      if (data.isTyping) {
        setTypingUser({ id: data.user.id, name: data.user.name });
      } else {
        setTypingUser((prev) =>
          prev && prev.id === data.user.id ? null : prev
        );
      }
    },
    [conversationIdParam, currentUser?.id]
  );

  const messageHandler = useCallback(
    (res: ResponseProps) => {
      if (!res.success || !res.data) {
        return;
      }

      const normalizedMessages = (res.data as any[]).map(normalizeMessage);
      setMessages(normalizedMessages);
      acknowledgeDelivery(normalizedMessages);
      acknowledgeRead(normalizedMessages);
    },
    [acknowledgeDelivery, acknowledgeRead, normalizeMessage]
  );

  const newMessageHandler = useCallback(
    (res: ResponseProps) => {
      setLoading(false);

      if (!res.success || !res.data) {
        Alert.alert("Error", res.msg || "Failed to send message");
        return;
      }

      const normalized = normalizeMessage(res.data);

      if (normalized.conversationId !== conversationIdParam) {
        return;
      }

      setMessages((prevMessages) => [normalized, ...prevMessages]);

      if (normalized.sender.id !== currentUser?.id) {
        setTypingUser((prev) =>
          prev && prev.id === normalized.sender.id ? null : prev
        );
        acknowledgeDelivery([normalized]);
        acknowledgeRead([normalized]);
      }
    },
    [
      acknowledgeDelivery,
      acknowledgeRead,
      conversationIdParam,
      currentUser?.id,
      normalizeMessage,
    ]
  );

  useEffect(() => {
    if (!conversationIdParam) return;

    newMessage(newMessageHandler);
    getMessage(messageHandler);
    messageStatusUpdated(messageStatusHandler);
    typing(typingHandler);

    getMessage({ conversationId: conversationIdParam });

    return () => {
      newMessage(newMessageHandler, true);
      getMessage(messageHandler, true);
      messageStatusUpdated(messageStatusHandler, true);
      typing(typingHandler, true);
    };
  }, [
    conversationIdParam,
    messageHandler,
    messageStatusHandler,
    typingHandler,
    newMessageHandler,
  ]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        emitTyping(false);
      }
    };
  }, [emitTyping]);

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

    if (!currentUser || !conversationIdParam) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    emitTyping(false);

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

      newMessage({
        conversationId: conversationIdParam,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        content: message.trim(),
        attachment,
      });

      setMessage("");
      setSelectedFile(null);
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
            data={messages}
            inverted={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageContent}
            renderItem={({ item }) => (
              <MessageItem
                item={item}
                isDirect={isDirect}
                participantIds={participantIds}
              />
            )}
            keyExtractor={(item) => String(item.id)}
          />

          <View style={styles.footer}>
            {typingUser && (
              <Typo
                size={13}
                color={colors.primaryDark}
                style={styles.typingIndicator}
                textProps={{ numberOfLines: 1 }}
              >
                {`${typingUser.name || "Someone"} is typing...`}
              </Typo>
            )}
            <Input
              value={message}
              onChangeText={handleTypingChange}
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
  typingIndicator: {
    paddingLeft: spacingX._10,
    paddingBottom: spacingY._5,
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
