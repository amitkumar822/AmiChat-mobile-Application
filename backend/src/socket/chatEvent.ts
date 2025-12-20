import { Server as SocketIOServer, Socket } from "socket.io";
import mongoose from "mongoose";
import Conversation from "../models/Conversation";
import Message from "../models/Message";

//chatEvent
export function registerChatEvent(io: SocketIOServer, socket: Socket) {
  socket.on("getConversations", async () => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("getConversations", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      // find all conversations where user is a participant
      const conversations = await Conversation.find({
        participants: userId,
      })
        .sort({ updatedAt: -1 })
        .populate({
          path: "lastMessage",
          select:
            "content senderId attachment createdAt deliveredTo readBy updatedAt",
        })
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      const conversationIds = conversations.map(
        (conversation) => new mongoose.Types.ObjectId(conversation._id)
      );

      const userObjectId = new mongoose.Types.ObjectId(userId);

      let unreadCountMap: Record<string, number> = {};

      if (conversationIds.length) {
        const unreadCounts = await Message.aggregate<{
          _id: mongoose.Types.ObjectId;
          count: number;
        }>([
          {
            $match: {
              conversationId: { $in: conversationIds },
              senderId: { $ne: userObjectId },
              readBy: { $ne: userObjectId },
            },
          },
          {
            $group: {
              _id: "$conversationId",
              count: { $sum: 1 },
            },
          },
        ]);

        unreadCountMap = unreadCounts.reduce((acc, item) => {
          acc[item._id.toString()] = item.count;
          return acc;
        }, {} as Record<string, number>);
      }

      const conversationsWithUnread = conversations.map((conversation) => ({
        ...conversation,
        unreadCount: unreadCountMap[conversation._id.toString()] || 0,
      }));

      socket.emit("getConversations", {
        success: true,
        data: conversationsWithUnread,
      });
      return;
    } catch (error) {
      console.error("Error getting conversations: ", error);
      return socket.emit("getConversations", {
        success: false,
        msg: "Failed to get conversations",
      });
    }
  });

  socket.on("newConversation", async (data) => {
    // console.log("newConversation event: ", data);

    try {
      if (data.type === "direct") {
        // check if conversation already exists
        const existingConversation = await Conversation.findOne({
          type: "direct",
          participants: { $all: data.participants, $size: 2 },
        })
          .populate({ path: "participants", select: "name avatar email" })
          .lean();

        if (existingConversation) {
          const userObjectId = new mongoose.Types.ObjectId(socket.data.userId);
          const unreadCount = await Message.countDocuments({
            conversationId: existingConversation._id,
            senderId: { $ne: userObjectId },
            readBy: { $ne: userObjectId },
          });

          socket.emit("newConversation", {
            success: true,
            data: { ...existingConversation, isNew: false, unreadCount },
          });
          return;
        }
      }

      // create new conversation
      const conversation = await Conversation.create({
        type: data.type,
        participants: data.participants,
        name: data.name || "", // can be empty for direct conversations
        avatar: data.avatar || "", // can be empty for direct conversations
        createdBy: socket.data.userId,
      });

      // get all connected sockets
      const connectedSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes(s.data.userId)
      );

      // join this conversation by all online participants
      connectedSockets.forEach((participantSocket) => {
        participantSocket.join(conversation._id.toString());
      });

      // send conversation data back (populate participants)
      const populatedConversation = await Conversation.findById(
        conversation._id
      )
        .populate({ path: "participants", select: "name avatar email" })
        .lean();

      if (!populatedConversation) {
        throw new Error("Failed to populate conversation");
      }

      // emit conversation to all participants in the conversation
      const conversationPayload = {
        ...populatedConversation,
        isNew: true,
        unreadCount: 0,
      };

      io.to(conversation._id.toString()).emit("newConversation", {
        success: true,
        data: conversationPayload,
      });
      return;
    } catch (error) {
      console.error("Error creating conversation: ", error);
      return socket.emit("newConversation", {
        success: false,
        msg: "Failed to create conversation",
      });
    }
  });

  socket.on("newMessage", async (data) => {
    try {
      const senderObjectId = new mongoose.Types.ObjectId(data.sender.id);

      const message = await Message.create({
        conversationId: data.conversationId,
        senderId: data.sender.id,
        content: data.content,
        attachment: data.attachment,
        deliveredTo: [senderObjectId],
        readBy: [senderObjectId],
      });

      const deliveredTo = (message.deliveredTo || []).map((id: any) =>
        id.toString()
      );
      const readBy = (message.readBy || []).map((id: any) => id.toString());

      io.to(data.conversationId).emit("newMessage", {
        success: true,
        data: {
          id: message._id,
          content: data.content,
          sender: {
            id: data.sender.id,
            name: data.sender.name,
            avatar: data.sender.avatar,
          },
          attachment: data.attachment,
          createdAt: message.createdAt.toISOString(),
          conversationId: data.conversationId,
          deliveredTo,
          readBy,
          updatedBy: data.sender.id,
        },
      });

      // update conversation last message
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: message._id,
      });

      const conversation = await Conversation.findById(
        data.conversationId
      ).select("participants");

      if (conversation) {
        await Promise.all(
          conversation.participants.map(async (participantId: any) => {
            const participantObjectId = new mongoose.Types.ObjectId(
              participantId
            );
            const unreadCount = await Message.countDocuments({
              conversationId: data.conversationId,
              senderId: { $ne: participantObjectId },
              readBy: { $ne: participantObjectId },
            });

            io.to(participantId.toString()).emit("unreadCountUpdated", {
              conversationId: data.conversationId,
              count: unreadCount,
            });
          })
        );
      }
      return;
    } catch (error) {
      console.error("Error sending message: ", error);
      return socket.emit("newMessage", {
        success: false,
        msg: "Failed to send message",
      });
    }
  });

  socket.on("getMessage", async (data: { conversationId: string }) => {
    try {
      const messages = await Message.find({
        conversationId: data.conversationId,
      })
        .sort({ createdAt: -1 })
        .populate<{
          senderId: { _id: string; name: string; avatar: string };
        }>({
          path: "senderId",
          select: "name avatar",
        })
        .lean();

      const messagesWithSender = messages.map((message) => {
        const attachment =
          (message as any).attachment || (message as any).attachement || null;

        return {
          ...message,
          id: message._id.toString(),
          sender: {
            id: message.senderId._id,
            name: message.senderId.name,
            avatar: message.senderId.avatar,
          },
          attachment,
          deliveredTo: (message as any).deliveredTo
            ? (message as any).deliveredTo.map((id: any) => id.toString())
            : [],
          readBy: (message as any).readBy
            ? (message as any).readBy.map((id: any) => id.toString())
            : [],
        };
      });

      socket.emit("getMessage", {
        success: true,
        data: messagesWithSender,
      });
      return;
    } catch (error) {
      console.error("Error fetching message: ", error);
      return [];
    }
  });

  socket.on(
    "messageDelivered",
    async (data: { messageId: string; conversationId: string }) => {
      try {
        const userId = socket.data.userId;
        if (!userId) {
          return;
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const message = await Message.findByIdAndUpdate(
          data.messageId,
          {
            $addToSet: { deliveredTo: userObjectId },
          },
          { new: true }
        );

        if (!message) {
          return;
        }

        io.to(data.conversationId).emit("messageStatusUpdated", {
          success: true,
          data: {
            messageId: message._id.toString(),
            conversationId: data.conversationId,
            deliveredTo: (message.deliveredTo || []).map((id) =>
              id.toString()
            ),
            readBy: (message.readBy || []).map((id) => id.toString()),
            updatedBy: userId,
          },
        });
      } catch (error) {
        console.error("Error updating delivery status: ", error);
      }
    }
  );

  socket.on(
    "messageRead",
    async (data: { messageIds: string[]; conversationId: string }) => {
      try {
        const userId = socket.data.userId;
        if (!userId || !data.messageIds?.length) {
          return;
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const updatedMessages: any[] = [];

        for (const messageId of data.messageIds) {
          const message = await Message.findByIdAndUpdate(
            messageId,
            {
              $addToSet: { deliveredTo: userObjectId, readBy: userObjectId },
            },
            { new: true }
          );

          if (message) {
            updatedMessages.push(message);
          }
        }

        const conversationObjectId = new mongoose.Types.ObjectId(
          data.conversationId
        );

        const unreadCount = await Message.countDocuments({
          conversationId: conversationObjectId,
          senderId: { $ne: userObjectId },
          readBy: { $ne: userObjectId },
        });

        updatedMessages.forEach((message) => {
          io.to(data.conversationId).emit("messageStatusUpdated", {
            success: true,
            data: {
              messageId: message._id.toString(),
              conversationId: data.conversationId,
              deliveredTo: (message.deliveredTo || []).map((id: any) =>
                id.toString()
              ),
              readBy: (message.readBy || []).map((id: any) => id.toString()),
              updatedBy: userId,
              unreadCount,
            },
          });
        });

        io.to(userId.toString()).emit("unreadCountUpdated", {
          conversationId: data.conversationId,
          count: unreadCount,
        });
      } catch (error) {
        console.error("Error updating read status: ", error);
      }
    }
  );

  socket.on(
    "typing",
    async (data: { conversationId: string; isTyping: boolean }) => {
      try {
        const userId = socket.data.userId;
        if (!userId || !data?.conversationId) {
          return;
        }

        const payload = {
          conversationId: data.conversationId,
          isTyping: Boolean(data.isTyping),
          user: {
            id: userId,
            name: socket.data?.name || socket.data?.email || "Someone",
          },
        };

        io.to(data.conversationId).emit("typing", payload);

        const conversation = await Conversation.findById(
          data.conversationId
        ).select("participants");

        if (conversation) {
          conversation.participants.forEach((participantId: any) => {
            const participant = participantId.toString();
            if (participant !== userId) {
              io.to(participant).emit("typing", payload);
            }
          });
        }
      } catch (error) {
        console.error("Error emitting typing event: ", error);
      }
    }
  );
}
