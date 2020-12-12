const app = require("express")();
var http = require("http");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const WebSocket = require("ws");
const socket = new WebSocket.Server({ server });

app.get("/", function (req, res) {
  res.send('Server is running...');
});

socket.on("connection", function (ws, req) {
  ws.on("alert_detect", function (message) {
    socket.clients.forEach(function (client) {
      //broadcast incoming message to all clients (s.clients)
      if (client != ws && client.readyState) {
        //except to the same client (ws) that sent this message
        client.send("broadcast: " + message);
      }
    });
  });
  console.log("new client connected");
});

server.listen(PORT);