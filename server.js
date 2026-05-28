const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

let players = {};

function randomPosition() {
  return {
    x: Math.floor(Math.random() * 800) + 50,
    y: Math.floor(Math.random() * 500) + 50
  };
}

io.on("connection", socket => {
  const pos = randomPosition();

  players[socket.id] = {
    id: socket.id,
    name: "Player" + socket.id.slice(0, 4),
    x: pos.x,
    y: pos.y,
    hp: 100,
    color: "#" + Math.floor(Math.random() * 16777215).toString(16)
  };

  io.emit("chat", "Servidor: um jogador entrou.");

  socket.on("move", data => {
    const p = players[socket.id];
    if (!p) return;

    p.x = Math.max(20, Math.min(940, data.x));
    p.y = Math.max(20, Math.min(620, data.y));
  });

  socket.on("chat", msg => {
    const p = players[socket.id];
    if (!p) return;

    const clean = String(msg).replace(/[<>]/g, "").slice(0, 80);
    io.emit("chat", `${p.name}: ${clean}`);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("chat", "Servidor: um jogador saiu.");
  });
});

setInterval(() => {
  io.emit("players", players);
}, 1000 / 30);

server.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
