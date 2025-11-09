import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { getConversations, newConversation, newMessage, testSocket } from "@/socket/socketEvents";
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

  useEffect(() => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    newMessage(newMessageHandler);

    getConversations(null);

    return () => {
      getConversations(processConversations, true);
      newConversation(newConversationHandler, true);
      newMessage(newMessageHandler, true);
    };
  }, []);

  const processConversations = (res: ResponseProps) => {
    // console.log("conversations response: ", JSON.stringify(res, null, 2));

    if (res.success) {
      setConversations(res.data);
    }
  };

  const newConversationHandler = (res: ResponseProps) => {
    if (res.success && res.data?.isNew) {
      setConversations((prev) => [...prev, res.data]);
    }
  };

  const newMessageHandler = (res: ResponseProps) => {
    if (res.success) {
      let conversationId = res.data.conversationId;

      setConversations((prev) => {
        let updatedConversations = prev.map((item) => {
          if (item._id === conversationId) {
            item.lastMessage = res.data;
          }
          return item;
        });
        return updatedConversations;
      })
    }
  }

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
