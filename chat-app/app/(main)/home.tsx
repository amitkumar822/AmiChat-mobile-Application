import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { getConversations, messageDelivered, messageStatusUpdated, newConversation, newMessage, unreadCountUpdated, typing } from "@/socket/socketEvents";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { router } from "expo-router";
import ConversationItem from "@/components/ConversationItem";
import Loading from "@/components/Loading";
import { ConversationProps, ResponseProps } from "@/types";

const Home = () => {
  const { user: currentUser, signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationProps[]>([]);

  const normalizeMessageSummary = useCallback((message: any) => {
    if (!message) return undefined;

    const deliveredTo = (message.deliveredTo || []).map(
      (id: any) => id?.toString?.() || id
    );
    const readBy = (message.readBy || []).map(
      (id: any) => id?.toString?.() || id
    );

    const senderId =
      message?.sender?.id ||
      message?.senderId?._id?.toString?.() ||
      message?.senderId?._id ||
      message?.senderId?.toString?.() ||
      message?.senderId;

    return {
      ...message,
      senderId,
      attachment: message?.attachment || message?.attachement || null,
      deliveredTo,
      readBy,
    };
  }, []);

  const normalizeConversation = useCallback(
    (conversation: any) => {
      return {
        ...conversation,
        unreadCount: Number(conversation.unreadCount || 0),
        typingStatus: conversation.typingStatus,
        lastMessage: normalizeMessageSummary(conversation.lastMessage),
      };
    },
    [normalizeMessageSummary]
  );

  const processConversations = useCallback(
    (res: ResponseProps) => {
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeConversation);
        setConversations(normalized);
      }
    },
    [normalizeConversation]
  );

  const newConversationHandler = useCallback(
    (res: ResponseProps) => {
      if (!res.success || !res.data) return;

      const normalized = normalizeConversation(res.data);

      setConversations((prev) => {
        const exists = prev.find((item) => item._id === normalized._id);

        if (exists) {
          return prev.map((item) =>
            item._id === normalized._id ? normalized : item
          );
        }

        return [...prev, normalized];
      });
    },
    [normalizeConversation]
  );

  const newMessageHandler = useCallback(
    (res: ResponseProps) => {
      if (!res.success || !res.data) return;

      const normalizedMessage = normalizeMessageSummary(res.data);
      const conversationId = res.data.conversationId;

      if (!conversationId) return;

      const senderId =
        normalizedMessage?.senderId ||
        normalizedMessage?.sender?.id ||
        res.data?.sender?.id;
      const isFromCurrentUser =
        senderId && currentUser?.id && senderId === currentUser.id;
      const messageId =
        normalizedMessage?.id ||
        normalizedMessage?._id ||
        res.data?.id ||
        res.data?._id;

      if (!isFromCurrentUser && messageId) {
        messageDelivered({
          messageId,
          conversationId,
        });
      }

      setConversations((prev) => {
        const updated = prev.map((conversation) => {
          if (conversation._id !== conversationId) return conversation;

          const prevUnreadCount = conversation.unreadCount || 0;
          const unreadCount = isFromCurrentUser
            ? prevUnreadCount
            : prevUnreadCount + 1;

          const lastMessage = normalizedMessage
            ? {
                _id:
                  normalizedMessage.id ||
                  normalizedMessage._id ||
                  conversation.lastMessage?._id,
                content: normalizedMessage.content,
                attachment: normalizedMessage.attachment,
                createdAt: normalizedMessage.createdAt,
                senderId:
                  normalizedMessage.senderId ||
                  normalizedMessage.sender?.id ||
                  normalizedMessage.senderId,
                deliveredTo: normalizedMessage.deliveredTo,
                readBy: normalizedMessage.readBy,
                type: normalizedMessage.type,
              }
            : conversation.lastMessage;

          return {
            ...conversation,
            lastMessage,
            updatedAt: normalizedMessage?.createdAt || conversation.updatedAt,
            unreadCount,
            typingStatus:
              !isFromCurrentUser &&
              conversation.typingStatus?.userId === senderId
                ? undefined
                : conversation.typingStatus,
          };
        });

        const focused = updated.find(
          (conversation) => conversation._id === conversationId
        );
        if (!focused) return updated;

        const rest = updated.filter(
          (conversation) => conversation._id !== conversationId
        );
        return [focused, ...rest];
      });
    },
    [currentUser?.id, normalizeMessageSummary]
  );

  const messageStatusHandler = useCallback(
    (res: ResponseProps) => {
      if (!res.success || !res.data) return;

      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation._id !== res.data.conversationId) return conversation;

          const shouldUpdateUnread =
            res.data.updatedBy === currentUser?.id &&
            typeof res.data.unreadCount === "number";

          const currentUnread = conversation.unreadCount || 0;
          const nextUnreadCount = shouldUpdateUnread
            ? res.data.unreadCount
            : currentUnread;

          if (!conversation.lastMessage) {
            if (nextUnreadCount === currentUnread) {
              return conversation;
            }

            return {
              ...conversation,
              unreadCount: nextUnreadCount,
            };
          }

          if (conversation.lastMessage._id !== res.data.messageId) {
            if (nextUnreadCount === currentUnread) {
              return conversation;
            }
            return {
              ...conversation,
              unreadCount: nextUnreadCount,
            };
          }

          return {
            ...conversation,
            lastMessage: {
              ...conversation.lastMessage,
              deliveredTo: res.data.deliveredTo || [],
              readBy: res.data.readBy || [],
            },
            unreadCount: nextUnreadCount,
          };
        })
      );
    },
    [currentUser?.id]
  );

  const typingHandler = useCallback(
    (data: any) => {
      if (!data?.conversationId || !data?.user) return;
      if (data.user.id === currentUser?.id) return;

      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation._id !== data.conversationId) return conversation;

          if (data.isTyping) {
            return {
              ...conversation,
              typingStatus: {
                userId: data.user.id,
                name: data.user.name,
                isTyping: true,
              },
            };
          }

          return {
            ...conversation,
            typingStatus:
              conversation.typingStatus?.userId === data.user.id
                ? undefined
                : conversation.typingStatus,
          };
        })
      );
    },
    [currentUser?.id]
  );

  const unreadCountHandler = useCallback((data: any) => {
    if (!data?.conversationId) return;
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === data.conversationId
          ? { ...conversation, unreadCount: Number(data.count || 0) }
          : conversation
      )
    );
  }, []);

  useEffect(() => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    newMessage(newMessageHandler);
    messageStatusUpdated(messageStatusHandler);
    unreadCountUpdated(unreadCountHandler);
    typing(typingHandler);

    getConversations(null);

    return () => {
      getConversations(processConversations, true);
      newConversation(newConversationHandler, true);
      newMessage(newMessageHandler, true);
      messageStatusUpdated(messageStatusHandler, true);
      unreadCountUpdated(unreadCountHandler, true);
      typing(typingHandler, true);
    };
  }, [
    messageStatusHandler,
    newConversationHandler,
    newMessageHandler,
    processConversations,
    typingHandler,
    unreadCountHandler,
  ]);

  // useEffect(() => {
  //   testSocket(testSocketCallbackHandler);
  //   testSocket(null);

  //   return () => {
  //     testSocket(testSocketCallbackHandler, true);
  //   };
  // }, []);

  // const testSocketCallbackHandler = (data: any) => {
  //   console.log(`Received data from server: `, data);
  // };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSettings = () => {
    router.push("/(main)/profileModal");
  };

  // const conversations = [
  //   {
  //     name: "Priya Sharma",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Priya Sharma",
  //       content: "Kya aap kal meeting ke liye available ho?",
  //       createdAt: "2023-01-15T14:30:00Z",
  //     },
  //   },
  //   {
  //     name: "Rahul Gupta",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Rahul Gupta",
  //       content: "Project ka status kya hai?",
  //       createdAt: "2024-01-15T12:15:00Z",
  //     },
  //   },
  //   {
  //     name: "Family Group",
  //     type: "group",
  //     lastMessage: {
  //       senderName: "Anita Singh",
  //       content: "Diwali ki planning karte hain sab",
  //       createdAt: "2025-01-15T10:45:00Z",
  //     },
  //   },
  //   {
  //     name: "Amit Kumar",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Amit Kumar",
  //       content: "Code review kar lo please",
  //       createdAt: "2025-01-15T09:20:00Z",
  //     },
  //   },
  //   {
  //     name: "Neha Patel",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Neha Patel",
  //       content: "Lunch karne chaloge?",
  //       createdAt: "2025-01-14T18:00:00Z",
  //     },
  //   },
  //   {
  //     name: "Office Team",
  //     type: "group",
  //     lastMessage: {
  //       senderName: "Vikram Mehta",
  //       content: "Standup meeting 10 AM mein",
  //       createdAt: "2025-01-14T16:30:00Z",
  //     },
  //   },
  //   {
  //     name: "Sneha Reddy",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Sneha Reddy",
  //       content: "Documents bhej diye hain, check karo",
  //       createdAt: "2025-01-14T14:20:00Z",
  //     },
  //   },
  //   {
  //     name: "Arjun Singh",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Arjun Singh",
  //       content: "Weekend plan kya hai?",
  //       createdAt: "2025-01-14T11:10:00Z",
  //     },
  //   },
  //   {
  //     name: "Kavya Iyer",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Kavya Iyer",
  //       content: "Presentation ready hai",
  //       createdAt: "2025-01-13T20:45:00Z",
  //     },
  //   },
  //   {
  //     name: "College Friends",
  //     type: "group",
  //     lastMessage: {
  //       senderName: "Rohan Desai",
  //       content: "Reunion ki date fix karte hain",
  //       createdAt: "2025-01-13T19:30:00Z",
  //     },
  //   },
  //   {
  //     name: "Manish Joshi",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Manish Joshi",
  //       content: "Bug fix kar diya hai",
  //       createdAt: "2025-01-13T17:15:00Z",
  //     },
  //   },
  //   {
  //     name: "Divya Nair",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Divya Nair",
  //       content: "Meeting notes share karungi",
  //       createdAt: "2025-01-13T15:00:00Z",
  //     },
  //   },
  //   {
  //     name: "Rohit Verma",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Rohit Verma",
  //       content: "Client ka response aaya hai",
  //       createdAt: "2025-01-12T13:45:00Z",
  //     },
  //   },
  //   {
  //     name: "Ananya Rao",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Ananya Rao",
  //       content: "Design mockups ready hain",
  //       createdAt: "2025-01-12T11:30:00Z",
  //     },
  //   },
  //   {
  //     name: "Tech Team",
  //     type: "group",
  //     lastMessage: {
  //       senderName: "Aditya Shah",
  //       content: "Deployment successful ho gaya",
  //       createdAt: "2025-01-12T09:20:00Z",
  //     },
  //   },
  //   {
  //     name: "Riya Agarwal",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Riya Agarwal",
  //       content: "Kal offline meeting hai",
  //       createdAt: "2025-01-11T18:00:00Z",
  //     },
  //   },
  //   {
  //     name: "Vishal Malhotra",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Vishal Malhotra",
  //       content: "API documentation update karni hai",
  //       createdAt: "2025-01-11T16:30:00Z",
  //     },
  //   },
  //   {
  //     name: "Shreya Das",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Shreya Das",
  //       content: "Test cases pass ho rahe hain",
  //       createdAt: "2025-01-11T14:15:00Z",
  //     },
  //   },
  // ];

  let directConversations = conversations
    .filter((item: ConversationProps) => item.type === "direct")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  let groupConversations = conversations
    .filter((item: ConversationProps) => item.type === "group")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              size={19}
              color={colors.neutral200}
              textProps={{ numberOfLines: 1 }}
            >
              Welcome Back,{" "}
              <Typo size={20} fontWeight="800" color={colors.white}>
                {currentUser?.name}
              </Typo>{" "}
              🧠
            </Typo>
          </View>

          <TouchableOpacity style={styles.settingIocn} onPress={handleSettings}>
            <Icons.GearSixIcon
              size={verticalScale(22)}
              color={colors.white}
              weight="fill"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingY._20 }}
          >
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[
                    styles.tabStyle,
                    selectedTab === 0 && styles.activeTabStyle,
                  ]}
                  onPress={() => setSelectedTab(0)}
                >
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabStyle,
                    selectedTab === 1 && styles.activeTabStyle,
                  ]}
                  onPress={() => setSelectedTab(1)}
                >
                  <Typo>Groups</Typo>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.converstionList}>
              {selectedTab == 0 &&
                directConversations.map((item: ConversationProps, index: number) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={index !== directConversations.length - 1}
                    />
                  );
                })}
              {selectedTab == 1 &&
                groupConversations.map((item: ConversationProps, index: number) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={index !== groupConversations.length - 1}
                    />
                  );
                })}
            </View>

            {!loading &&
              selectedTab == 0 &&
              directConversations.length == 0 && (
                <Typo style={{ textAlign: "center" }}>
                  You don't have any messages
                </Typo>
              )}
            {!loading && selectedTab == 1 && groupConversations.length == 0 && (
              <Typo style={{ textAlign: "center" }}>
                You haven't joined any groups yet
              </Typo>
            )}

            {loading && <Loading />}
          </ScrollView>
        </View>
      </View>

      <Button
        style={styles.floatingButton}
        onPress={() => router.push({
          pathname: "/(main)/newCovnersationModal",
          params: {
            isGroup: selectedTab
          },
        })}
      >
        <Icons.PlusIcon
          size={verticalScale(24)}
          weight="bold"
          color={colors.black}
        />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._10,
    gap: spacingX._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: "row",
    gap: spacingX._10,
    alignItems: "center",
    paddingHorizontal: spacingX._10,
  },
  tabs: {
    flexDirection: "row",
    gap: spacingX._10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },
  converstionList: {
    paddingVertical: spacingY._20,
  },
  settingIocn: {
    padding: spacingX._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
