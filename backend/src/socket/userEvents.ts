import { Socket, Server as SocketIOServer } from "socket.io";

export function registerUserEvents(_io: SocketIOServer, socket: Socket) {
  // when user connects, register events
  socket.on("testSocket", (_data) => {
    socket.emit("testSocket", { msg: "It's working" });
  });
}
