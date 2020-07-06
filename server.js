const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 4001;
const fetch = require("node-fetch");

const DEFAULT_ROOM = "abcd";
var rooms = [{id: DEFAULT_ROOM, clients: []}];
var clients = rooms.filter(room => room.id  === DEFAULT_ROOM)[0].clients;
let room = DEFAULT_ROOM;

const usernameApi = "http://randomuser.me/api";
var timer = 0;
var timerHandle;

async function getRandomUsername() {
  await fetch(usernameApi)
    .then(res => res.json())
    .then(data => user = {
      name: data.results[0].name.first,
      uuid: data.results[0].login.uuid,
      clicks: 0,
    });
  return user;
}

function getWinner() {
  let players = clients.sort((a, b) => a.clicks < b.clicks ? 1 : -1);
  let winners = [];
  let topClicks = 0;
  for (player of players) {
    if (player.clicks >= topClicks) {
      winners.push(player);
      topClicks = player.clicks;
    }
  }
  if (winners.length > 1) {
    console.log("there was a tie");
  }
  io.to(room).emit("endGame", winners);
}

function timerHandler() {
  timer = timer - 1;
  if (timer === 0) {
    clearInterval(timerHandle);
    let winner = getWinner();
  }
}

io.on("connection", async socket => {
  console.log("Client [" + socket.id + "] connected");
  let user = await getRandomUsername();
  user['socket'] = socket.id;
  socket.emit("userDetails", user);
  socket.join(room);
  clients.push(user);
  io.to(room).emit("updateClients", clients);
  socket.on("startGame", res => {
    console.log("Starting game");
    timer = 5;
    timerHandle = setInterval(timerHandler,1000);
    io.to(room).emit("startGame", {timer: timer});
  });
  socket.on("updateClicks", res => {
    let cIdx = clients.findIndex(element =>
      element.uuid === res.uuid);
    clients[cIdx] = {...clients[cIdx], clicks: res.clicks};
    io.to(room).emit("updateClients", clients);
  });
  socket.on("disconnect", res => {
    console.log("Client [" + socket.id + "] disconnected");
    clients = clients.filter((client) => client.socket !== socket.id);
    io.sockets.emit("updateClients", clients);
  });
});

http.listen(port, () => console.log("Server started on port " + port));
