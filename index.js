const app = require("express")();
var http = require("http");
var bodyParser = require("body-parser");

var firebase = require("firebase/app");
require("firebase/auth");
var admin = require("firebase-admin");
var serviceAccount = require("./drowsiness-detect-eb2a3-firebase-adminsdk-2fym5-a0ebca0cb6.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://drowsiness-detect-eb2a3.firebaseio.com",
});

const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const WebSocket = require("ws");
const socket = new WebSocket.Server({server});

var db = admin.database();
var ref = db.ref("server/saving-data/fireblog/posts");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

let isAuthorized = true;

app.get("/", function (req, res) {
	res.json("Server is running...");
});

app.post("/login/:token", checkAuth);
app.get("/register", register);

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

function checkAuth(req, res, next) {
	token = req.params.token;
	console.log(token);
	firebase
		.auth()
		.signInWithCustomToken(token)
		.then((user) => {
			res.send(user);
		})
		.catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			res.status(403).send("Unauthorized!");
		});
}

function register(req, res, next) {
	const uid = "QRcdTlNzwBSWB9byOdX2RhEVfpz2";
	admin
		.auth()
		.createCustomToken(uid)
		.then((customToken) => {
			console.log(customToken);
			res.send(customToken);
		})
		.catch((error) => {
			console.log("Error creating custom token:", error);
		});
}

server.listen(PORT);
