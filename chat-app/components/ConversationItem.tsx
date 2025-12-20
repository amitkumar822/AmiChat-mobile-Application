import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { ConversationListItemProps } from "@/types";
import Avatar from "./Avatar";
import moment from "moment";
import Typo from "./Typo";
import { useAuth } from "@/contexts/authContext";
import * as Icons from "phosphor-react-native";

const ConversationItem = ({
    item,
    showDivider,
    router,
}: ConversationListItemProps) => {
    const { user: currentUser } = useAuth();

    const lastMessage: any = item.lastMessage;
    const isDirect = item.type === "direct";
    let avatar = item?.avatar;
    const otherParticipant = isDirect
        ? item.participants.find(
            (participant: any) => participant._id !== currentUser?.id
        )
        : null;

    if (isDirect && otherParticipant) {
        avatar = otherParticipant?.avatar;
    }

    const getLastMessageDate = () => {
        if (!lastMessage?.createdAt) return null;

        const messageDate = moment(lastMessage?.createdAt);

        const today = moment();

        if (messageDate.isSame(today, "day")) {
            return messageDate.format("h:mm A");
        }
        if (messageDate.isSame(today, "year")) {
            return messageDate.format("MMM D");
        }

        return messageDate.format("MMM D, YYYY");
    };

    const getLastMessageContent = () => {
        if (!lastMessage) return "Say hi 👋";

        const hasAttachment =
            lastMessage?.attachment || (lastMessage as any)?.attachement;

        return hasAttachment ? "Image" : lastMessage?.content;
    };

    const showTyping =
        !!item.typingStatus?.isTyping &&
        item.typingStatus.userId !== currentUser?.id;

    const typingLabel = isDirect
        ? "Typing..."
        : `${item.typingStatus?.name ?? "Someone"} is typing...`;

    const renderStatusIcon = () => {
        if (showTyping || !lastMessage || !currentUser?.id) return null;
        if (lastMessage.senderId !== currentUser.id) return null;

        const otherParticipantIds = item.participants
            .map((participant: any) => participant._id)
            .filter((id: string) => id !== currentUser.id);

        if (!otherParticipantIds.length) return null;

        const delivered = otherParticipantIds.every((id: string) =>
            (lastMessage.deliveredTo || []).includes(id)
        );
        const read = otherParticipantIds.every((id: string) =>
            (lastMessage.readBy || []).includes(id)
        );

        if (read) {
            return (
                <Icons.Checks
                    size={16}
                    weight="bold"
                    color="#2563eb"
                    style={styles.statusIcon}
                />
            );
        }

        if (delivered) {
            return (
                <Icons.Checks
                    size={16}
                    weight="bold"
                    color={colors.neutral600}
                    style={styles.statusIcon}
                />
            );
        }

        return (
            <Icons.Check
                size={16}
                weight="bold"
                color={colors.neutral600}
                style={styles.statusIcon}
            />
        );
    };


    const openConversation = () => {
        router.push({
            pathname: "/(main)/conversation",
            params: {
                id: item._id,
                name: item.name,
                avatar: item.avatar,
                type: item.type,
                participants: JSON.stringify(item.participants),
            },
        });
    };

    return (
        <View>
            <TouchableOpacity
                onPress={openConversation}
                style={styles.conversationItem}
            >
                <View>
                    <Avatar uri={avatar} size={47} isGroup={item.type === "group"} />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                        <Typo size={17} fontWeight={"600"}>
                            {isDirect ? otherParticipant?.name : item?.name}
                        </Typo>
                            <View style={styles.rightMeta}>
                                {item?.lastMessage && !showTyping && (
                                    <Typo size={15}>{getLastMessageDate()}</Typo>
                                )}
                                {item?.unreadCount ? (
                                    <View style={styles.unreadBadge}>
                                        <Typo
                                            size={12}
                                            fontWeight={"700"}
                                            color={colors.white}
                                        >
                                            {item.unreadCount > 99
                                                ? "99+"
                                                : item.unreadCount}
                                        </Typo>
                                    </View>
                                ) : null}
                            </View>
                    </View>

                    <View style={styles.lastMessageRow}>
                        {renderStatusIcon()}
                        {showTyping ? (
                            <Typo
                                size={15}
                                fontWeight={"600"}
                                color={colors.primaryDark}
                                textProps={{ numberOfLines: 1 }}
                            >
                                {typingLabel}
                            </Typo>
                        ) : (
                            <Typo
                                size={15}
                                color={colors.neutral600}
                                textProps={{ numberOfLines: 1 }}
                            >
                                {getLastMessageContent()}
                            </Typo>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {showDivider && <View style={styles.divider} />}
        </View>
    );
};

export default ConversationItem;

const styles = StyleSheet.create({
    conversationItem: {
        gap: spacingY._10,
        marginVertical: spacingY._12,
        flexDirection: "row",
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rightMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._7,
    },
    divider: {
        height: 1,
        width: "95%",
        alignSelf: "center",
        backgroundColor: "rgba(0, 0, 0, 0.07)",
    },
    lastMessageRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusIcon: {
        marginTop: 2,
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        minWidth: 24,
        paddingHorizontal: spacingX._7,
        paddingVertical: 2,
        alignItems: "center",
        justifyContent: "center",
    },
});
