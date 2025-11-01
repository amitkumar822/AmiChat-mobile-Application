import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { Server as SocketIOServer, Socket } from "socket.io";
import { registerUserEvents } from "./userEvents";

export function initializeSocket(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  }); // socket io server instance

  // auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }

        // attach user data to socket
        let userData = decoded.user;
        socket.data = userData;
        socket.data.userId = userData.id;
        next();
      }
    );
  });

  // when socket connects, register events
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected:${userId} with socket id:${socket.id}`);

    // register events
    registerUserEvents(io, socket);

    
    socket.on("disconnect", () => {
      // user logged out
      console.log(`User disconnected:${userId} with socket id:${socket.id}`);
    });
  });


  return io;
}
