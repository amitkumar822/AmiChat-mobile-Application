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
  } else if (typeof playoad === "function") {
    // turn on listing to this event
    socket.on("testSocket", playoad); // payload as callback for this event
  } else {
    // turn on listing to this event
    socket.emit("testSocket", playoad); // sending payload as data
  }
};

export const updateProfile = (playoad: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected");
    return;
  }

  if (off) {
    // turn off listing to this event
    socket.off("updateProfile", playoad); // payload is the callback
  } else if (typeof playoad === "function") {
    // turn on listing to this event
    socket.on("updateProfile", playoad); // payload as callback for this event
  } else {
    // turn on listing to this event
    socket.emit("updateProfile", playoad); // sending payload as data
  }
};

export const getContacts = (playoad: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected");
    return;
  }

  if (off) {
    // turn off listing to this event
    socket.off("getContacts", playoad); // payload is the callback
  } else if (typeof playoad === "function") {
    // turn on listing to this event
    socket.on("getContacts", playoad); // payload as callback for this event
  } else {
    // turn on listing to this event
    socket.emit("getContacts", playoad); // sending payload as data
  }
};

export const newConversation = (playoad: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected");
    return;
  }

  if (off) {
    // turn off listing to this event
    socket.off("newConversation", playoad); // payload is the callback
  } else if (typeof playoad === "function") {
    // turn on listing to this event
    socket.on("newConversation", playoad); // payload as callback for this event
  } else {
    // turn on listing to this event
    socket.emit("newConversation", playoad); // sending payload as data
  }
};

export const getConversations = (playoad: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected");
    return;
  }

  if (off) {
    // turn off listing to this event
    socket.off("getConversations", playoad); // payload is the callback
  } else if (typeof playoad === "function") {
    // turn on listing to this event
    socket.on("getConversations", playoad); // payload as callback for this event
  } else {
    // turn on listing to this event
    socket.emit("getConversations", playoad); // sending payload as data
  }
};

export const newMessage = (playoad: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected");
    return;
  }

  if (off) {
    // turn off listing to this event
    socket.off("newMessage", playoad); // payload is the callback
  } else if (typeof playoad === "function") {
    // turn on listing to this event
    socket.on("newMessage", playoad); // payload as callback for this event
  } else {
    // turn on listing to this event
    socket.emit("newMessage", playoad); // sending payload as data
  }
};

export const getMessage = (playoad: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected");
    return;
  }

  if (off) {
    // turn off listing to this event
    socket.off("getMessage", playoad); // payload is the callback
  } else if (typeof playoad === "function") {
    // turn on listing to this event
    socket.on("getMessage", playoad); // payload as callback for this event
  } else {
    // turn on listing to this event
    socket.emit("getMessage", playoad); // sending payload as data
  }
};
