import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { MessageProps } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useAuth } from "@/contexts/authContext";
import Avatar from "./Avatar";
import Typo from "./Typo";

const MessageItem = ({
    item,
    isDirect,
}: {
    item: MessageProps;
    isDirect: boolean;
}) => {
    const { user: currentUser } = useAuth();
    const isMe = item.isMe;

    return (
        <View
            style={[
                styles.messageContainer,
                isMe ? styles.myMessage : styles.theireMessage,
            ]}
        >
            {!isMe && !isDirect && (
                <Avatar uri={null} size={30} style={styles.messageAvatar} />
            )}

            <View
                style={[
                    styles.messageBubble,
                    isMe ? styles.myBubble : styles.theireBubble,
                ]}
            >
                {!isMe && !isDirect && (
                    <Typo size={13} color={colors.neutral900} fontWeight="600">
                        {item.sender.name}
                    </Typo>
                )}

                {item.content && <Typo size={15}>{item.content}</Typo>}

                <Typo
                    style={{ alignSelf: "flex-end" }}
                    size={11}
                    color={colors.neutral600}
                >
                    {item.createdAt}
                </Typo>
            </View>
        </View>
    );
};

export default MessageItem;

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        gap: spacingX._7,
        maxWidth: "80%",
    },
    myMessage: {
        alignSelf: "flex-end",
    },
    theireMessage: {
        alignSelf: "flex-start",
    },
    messageAvatar: {
        alignSelf: "flex-end",
    },
    attachment: {
        width: verticalScale(180),
        height: verticalScale(100),
        borderRadius: radius._10,
    },
    messageBubble: {
        padding: spacingX._10,
        borderRadius: radius._15,
        gap: spacingY._5,
    },
    myBubble: {
        backgroundColor: colors.myBubble,
    },
    theireBubble: {
        backgroundColor: colors.otherBubble,
    },
});
