import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const peers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("register-peer", (peerId) => {
    peers.set(socket.id, peerId);
    io.emit("peer-list-update", Array.from(peers.values()));
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    peers.delete(socket.id);
    io.emit("peer-list-update", Array.from(peers.values()));
  });

  socket.on("peer-disconnect", (peerId) => {
    console.log(`Peer disconnected: ${peerId}`);
    peers.delete(peerId);
    io.emit("peer-disconnected", peerId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
