const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const connectedClientList = [];

io.on("connection", (socket) => {
  // 새로운 클라이언트가 연결될 때
  console.log("새로운 클라이언트가 연결되었습니다.");
  connectedClientList.push(socket.id);
  console.log("연결된 id: ", connectedClientList);

  socket.on("offer", (offer) => {
    // 클라이언트가 offer를 보냈을 때
    console.log("클라이언트가 offer를 보냈습니다.");
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    // 클라이언트가 answer를 보냈을 때
    console.log("클라이언트가 answer를 보냈습니다.");
    socket.broadcast.emit("answer", answer);
  });

  socket.on("icecandidate", (candidate) => {
    // 클라이언트가 ICE candidate를 보냈을 때
    console.log("클라이언트가 ICE candidate를 보냈습니다.");
    socket.broadcast.emit("icecandidate", candidate);
  });

  socket.on("disconnect", () => {
    // 클라이언트가 연결을 끊었을 때
    console.log("클라이언트가 연결을 끊었습니다.");
    const index = connectedClientList.indexOf(socket.id);
    index !== -1 && connectedClientList.splice(index, 1);
    console.log("연결된 id: ", connectedClientList);
  });
});

server.listen(8000, () => {
  console.log("시그널링 서버가 시작되었습니다.");
});
