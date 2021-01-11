const app = require("express")();
var http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const WebSocket = require("ws");
const socket = new WebSocket.Server({ server });
socket.on("connection", function (ws, req) {
	console.log("new client connected");
	ws.on("message", function (message) {
		socket.clients.forEach(function (client) {
			//broadcast incoming message to all clients (s.clients)
			if (client != ws && client.readyState) {
				//except to the same client (ws) that sent this message
				client.send("broadcast: " + message);
				console.log("sending...");
			}
		});
	});
});

server.listen(PORT);