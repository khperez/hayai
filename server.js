const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 4001;

var clients = [];

io.on("connection", socket => {
  console.log("Client [" + socket.id + "] connected");
  clients.push({id: socket.id, username: socket.id});
  io.sockets.emit("updateClients", clients);
  socket.on("disconnect", res => {
    console.log("Client [" + socket.id + "] disconnected");
    const connectedClients = clients.filter((client) => client.id !== socket.id);
    io.sockets.emit("updateClients", connectedClients);
  });
});

http.listen(port, () => console.log("Server started on port " + port));
