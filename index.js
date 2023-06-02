const server = require("http").createServer();
const io = require("socket.io")(server, {
  transports: ["websocket", "polling"],
});

const rooms = {};
const users = {};

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    socket.join(data);
  });

  socket.on("connection", (data) => {
    users[socket.id] = { ...data, id: socket.id };
    console.log({ ...data, id: socket.id });
    if (rooms.hasOwnProperty(data.roomId)) {
      rooms[data.roomId] = [...rooms[data.roomId], data.name];
    } else {
      rooms[data.roomId] = [data.name];
    }

    io.to(data.roomId).emit("connection", rooms[data.roomId]);
  });

  socket.on("disconnecting", () => {
    const roomId = users[socket.id]?.roomId;
    if (rooms.hasOwnProperty(roomId)) {
      rooms[roomId] = [
        ...rooms[roomId].filter((item) => item !== users[socket.id].name),
      ];
    }
    io.to(roomId).emit("connection", rooms[roomId]);
  });

  socket.on("messages", (mess) => {
    io.to(mess.roomId).emit("messages", mess);
  });

  console.log("user connected");
});
server.listen(3000, () => console.log("lll"));
