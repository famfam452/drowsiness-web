const app = require("express")();
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const WebSocket = require("ws");
const firebase_admin = require("./app/model/firebase");
const authController = require("./app/controller/auth.controller");
const authJWT = require("./app/middleware/authJwt");

const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({server});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const firebase = new firebase_admin();
var db = firebase.admin.database();

let pair = {};

app.use(function (req, res, next) {
	res.header(
		"Access-Control-Allow-Headers",
		"x-access-token, Origin, Content-Type, Accept"
	);
	next();
});

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/api/auth/signin", function (req, res) {
	authController.signin(req, res, db);
});

app.post(
	"/api/auth/changePassword",
	[authJWT.verifyToken],
	function (req, res) {
		authController.changePassword(req, res, db);
	}
);

app.get("/api/user/data", [authJWT.verifyToken], function (req, res) {
	let userRef = db.ref(`users/${req.username}`);
	userRef.once("value", (snapshot) => {
		res.json(snapshot.val());
	});
});

app.get("/api/user/alert", [authJWT.verifyToken], function (req, res) {
	let notificationRef = db.ref(`users/${req.username}/notification`);
	notificationRef.once("value", (snapshot) => {
		res.json(snapshot.val());
	});
});

wss.on("connection", function (ws, req) {
	console.log("new client connected");
	let websocketProtocol = req.headers["sec-websocket-protocol"];
	let websocketProtocolArray = String(websocketProtocol).split('.');
	let clientProtocol = websocketProtocolArray[0].slice(0, 6);
	let username = websocketProtocolArray[1];

	let pairedUser;
	let user;
	if(clientProtocol == "device") {
		pairedUser = "mobile." + username;
		user = "device." + username;
		pair[user] = ws;
	}
	else if(clientProtocol == "mobile") {
		pairedUser = "device." + username;
		user = "mobile." + username;
		pair[user] = ws;
	}

	function aiPredict(ms) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// AI predict
				let predictResult = true;
				console.log(`Predict: ${predictResult}`);
				resolve(predictResult);
			}, ms);
		})
	}
	
	ws.on("message", async (message) => {
		console.log(`Message: ${message}`)
		if (clientProtocol == "device") {
			let predictResult = await aiPredict(3000);
			if (predictResult) {
				let ref = db.ref(`users/${username}`);
				let notiRef = ref.child("notification");
				notiRef.push({
					dateTime: message,
				});
				console.log("Storing data...");
				if(pair[pairedUser]) {
					pair[pairedUser].send(JSON.stringify({message: "Drowsiness Alert"}));
				}
				else {
					console.log("No connection")
				}
			}
			else {
				console.log('hi')
			}
		} else if (clientProtocol == "mobile") {
		}
	});

	ws.on("close", () => {
		console.log(`Disconnect! ${clientProtocol}.${username}`);
		delete pair[user];
	});
});


// function authenticate(req, callback) {
// }

// server.on("upgrade", function upgrade(request, socket, head) {
// 	authenticate(request, (err, client) => {
// 		if (err || !client) {
// 			console.log("Unauthorized");
// 			socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
// 			socket.destroy();
// 			return;
// 		}

// 		wss.handleUpgrade(request, socket, head, function done(ws) {
// 			wss.emit("connection", ws, request, client);
// 		});
// 	});
// });

server.listen(PORT, () => {
	console.log(`Server is listening at ${PORT}`);
});
