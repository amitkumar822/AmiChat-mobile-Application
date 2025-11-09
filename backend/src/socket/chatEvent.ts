import { Server as SocketIOServer, Socket } from "socket.io";
import Conversation from "../models/Conversation";
import Message from "../models/Message";

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
          select: "content senderId attachment createdAt",
        })
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      socket.emit("getConversations", {
        success: true,
        data: conversations,
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
          socket.emit("newConversation", {
            success: true,
            data: { ...existingConversation, isNew: false },
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
      io.to(conversation._id.toString()).emit("newConversation", {
        success: true,
        data: { ...populatedConversation, isNew: true },
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
      const message = await Message.create({
        conversationId: data.conversationId,
        senderId: data.sender.id,
        content: data.content,
        attachment: data.attachment,
      });

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
        },
      });

      // update conversation last message
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: message._id,
      });
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
}
