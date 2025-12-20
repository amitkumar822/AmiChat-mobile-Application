import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { MessageProps } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useAuth } from "@/contexts/authContext";
import Avatar from "./Avatar";
import Typo from "./Typo";
import moment from "moment";
import { Image } from "expo-image";
import * as Icons from "phosphor-react-native";

const MessageItem = ({
  item,
  isDirect,
  participantIds,
}: {
  item: MessageProps;
  isDirect: boolean;
  participantIds: string[];
}) => {
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.id === item.sender.id;

  const formattedDate = useMemo(() => {
    const date = moment(item.createdAt).isSame(moment(), "day")
      ? moment(item.createdAt).format("h:mm A")
      : moment(item.createdAt).format("MMM D, h:mm A");
    return date;
  }, [item.createdAt]);

  const deliveryStatusIcon = useMemo(() => {
    if (!isMe) return null;
    if (!participantIds?.length) return null;

    const otherParticipantIds = participantIds.filter(
      (id) => id !== currentUser?.id
    );

    if (!otherParticipantIds.length) return null;

    const delivered = otherParticipantIds.every((id) =>
      (item.deliveredTo || []).includes(id)
    );
    const read = otherParticipantIds.every((id) =>
      (item.readBy || []).includes(id)
    );

    if (read) {
      return (
        <Icons.Checks
          size={verticalScale(14)}
          weight="bold"
          color="#2563eb"
        />
      );
    }

    if (delivered) {
      return (
        <Icons.Checks
          size={verticalScale(14)}
          weight="bold"
          color={colors.neutral600}
        />
      );
    }

    return (
      <Icons.Check
        size={verticalScale(14)}
        weight="bold"
        color={colors.neutral600}
      />
    );
  }, [
    currentUser?.id,
    isMe,
    item.deliveredTo,
    item.readBy,
    participantIds,
  ]);

  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.theireMessage,
      ]}
    >
      {!isMe && !isDirect && (
        <Avatar
          uri={item?.sender?.avatar}
          size={30}
          style={styles.messageAvatar}
        />
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

        {!!item.attachment && (
          <Image
            source={{ uri: item.attachment }}
            style={styles.attachment}
            contentFit="cover"
            transition={100}
          />
        )}

        {item.content ? <Typo size={15}>{item.content}</Typo> : null}

        <View style={styles.metaRow}>
          <Typo size={11} color={colors.neutral600}>
            {formattedDate}
          </Typo>
          {deliveryStatusIcon ? (
            <View style={styles.statusIcon}>{deliveryStatusIcon}</View>
          ) : null}
        </View>
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
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        gap: spacingX._5,
    },
    statusIcon: {
        marginLeft: spacingX._3,
    },
});
