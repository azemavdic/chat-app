const path = require("path"); //Core Node.js module, ne treba instalirati
const http = require("http"); // Core module
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessages,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on("connection", (socket) => {
  console.log("New WebSocket connection!");

  //Server salje podatke svima osim trenutnom korisniku koji se prikljucio

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("welcomeMessage", generateMessage("Admin", "Dobrodošli!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "welcomeMessage",
        generateMessage("Admin", `${user.username} se pridružio razgovoru!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("poruka", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    const loseRijeci = ["mrs"];
    filter.addWords(...loseRijeci);
    if (filter.isProfane(message)) {
      return callback("Ponašaj se pristojno");
    }

    io.to(user.room).emit(
      "welcomeMessage",
      generateMessage(user.username, message)
    );
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessages(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "welcomeMessage",
        generateMessage(`${user.username} je napustio razgovor`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
}); // Kada se korisnik iskljuci iz razgovora

server.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});
