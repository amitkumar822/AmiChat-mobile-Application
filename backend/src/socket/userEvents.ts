import { Socket, Server as SocketIOServer } from "socket.io";
import User from "../models/User";
import { generateToken } from "../utils/token";

export function registerUserEvents(_io: SocketIOServer, socket: Socket) {
  // when user connects, register events
  // socket.on("testSocket", (_data) => {
  //   socket.emit("testSocket", { msg: "It's working" });
  // });

  socket.on(
    "updateProfile",
    async (data: { name?: string; avatar?: string }) => {
      // console.log("data:====>", JSON.stringify(data, null, 2));

      const userId = socket.data.userId;
      if (!userId) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "Unauthorized",
        });
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { name: data.name, avatar: data.avatar },
          { new: true } // will return the updated user
        );

        if (!updatedUser) {
          return socket.emit("updateProfile", {
            success: false,
            msg: "User not found",
          });
        }

        // get token with updated user data
        const newToken = generateToken(updatedUser);

        // emit the updated profile data to the client
        return socket.emit("updateProfile", {
          success: true,
          data: {
            token: newToken,
          },
          msg: "Profile updated successfully",
        });
      } catch (error) {
        console.error("Error updating profile: ", error);
        return socket.emit("updateProfile", {
          success: false,
          msg: "Failed to update profile",
        });
      }
    }
  );

  socket.on("getContacts", async () => {
    try {
      const currentUserId = socket.data.userId;
      if (!currentUserId) {
        return socket.emit("getContacts", {
          success: false,
          msg: "Unauthorized",
        });
      }

      const users = await User.find(
        { id: { $ne: currentUserId } },
        { password: 0 } // exclude password from the response
      ).lean();

      const contacts = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        avatar: user.avatar || "",
        email: user.email,
      }));

      return socket.emit("getContacts", {
        success: true,
        data: contacts,
        msg: "Contacts fetched successfully",
      });
    } catch (error) {
      console.error("Error getting contacts: ", error);
      return socket.emit("getContacts", {
        success: false,
        msg: "Failed to get contacts",
      });
    }
  });
}
