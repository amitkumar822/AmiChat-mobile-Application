import { getSocket } from "./socket";

export const testSocket = (playoad: any, off: boolean = false) => {
    const socket = getSocket();
    if (!socket) {
        console.log("Socket not connected");
        return;
    }

    if (off) {
        // turn off listing to this event
        socket.off("testSocket", playoad); // payload is the callback
    } else if(typeof playoad === "function") {
        // turn on listing to this event
        socket.on("testSocket", playoad); // payload as callback for this event
    } else {
        // turn on listing to this event
        socket.emit("testSocket", playoad); // sending payload as data
    }
}

