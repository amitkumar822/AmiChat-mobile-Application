import { Socket, Server as SocketIOServer } from "socket.io";

export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  // when user connects, register events
  socket.on("testSocket", (data) => {
    socket.emit("testSocketResponse", { msg: "It's working" });
  });
}
