import { io } from "socket.io-client";
import { SERVER_URL } from "../constant/socketServer";

export const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

export const send_offer = (offer) => {
  socket.emit("offer", offer);
};

export const send_answer = (answer) => {
  socket.emit("answer", answer);
};

export const send_icecandidate = (candidate) => {
  socket.emit("icecandidate", candidate);
};
