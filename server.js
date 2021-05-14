const app = require("express")();
const exprss = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
// const WebSocket = require("ws");
const firebase_admin = require("./app/model/firebase");
const authController = require("./app/controller/auth.controller");
const authJWT = require("./app/middleware/authJwt");

// const firebase_admin2 = require("./app/model/firebase2");

const server = http.createServer(app);
const PORT = process.env.PORT || 8081;
// const wss = new WebSocket.Server({server});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/css', exprss.static(path.join(__dirname,'node_modules/bootstrap/dist/css')));
app.use('/js', exprss.static(path.join(__dirname,'node_modules/bootstrap/dist/js')));
app.use('/js', exprss.static(path.join(__dirname,'node_modules/jquery/dist')));

const firebase_uid = 'drowsy-server'
const firebase = new firebase_admin();
firebase.admin.auth().createCustomToken(firebase_uid);
// const firebase2 = new firebase_admin2();

var db = firebase.admin.database();
// var db2 = firebase2.admin.database();


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

app.get("/history/:userId", function (req, res) {
	res.sendFile(path.join(__dirname + "/app/view/userHistory.html"),);
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

app.get("/getAllUser",function (req,res) {
	let userRef = db.ref(`users`);
	userRef.once("value", (snapshot) => {
		res.json(snapshot.val());
		console.log(snapshot.val());
	});
})

app.get("/getAUser/:userID",function (req,res) {
	console.log(req.params.userID);
	let itRef = db.ref('users/'+req.params.userID);
	itRef.once('value', (snapshot) => {
		console.log(snapshot.val());
		res.json(snapshot.val());
	});
});


let useref = db.ref(`users`);
setInterval(() => {
	useref.once('value', (snap) => {
		var snapOb = snap.val();
		Object.keys(snapOb).forEach(key => {
			var vals = snapOb[key];
			var eachNoti = vals['notification'];
			var lastDate;
			if(eachNoti){
				var lowest;
				var couter = 0;
				Object.values(eachNoti).forEach(eachInstance => {
					if(couter == 0){
						lastDate = eachInstance['dateTime'];
						lowest = new Date(eachInstance['dateTime']);
					}
					couter += 1;
					var theTime = new Date(eachInstance['dateTime']);
					if(theTime > lowest){
						lastDate = eachInstance['dateTime'];
						lowest = theTime;
					}
				});
				lastDate += "+07:00";
				var tsDt = Date.parse(lastDate);
				var thisTime = Date.now();
				var diffTime = thisTime - tsDt;
				// console.log(thisTime+" - "+tsDt+" = "+diffTime);
				var timeDatenow = new Date(thisTime);
				// console.log(timeDatenow.toISOString());
				if(diffTime >= 300000){
					useref.child(`${key}`).update({status:"normal"});
				}else{
					useref.child(`${key}`).update({status:"sleepy"});
				}
			}
		  });
	});
},2000);

// app.get("/getSomedata",function (req,res) {
// 	let userRef = db.ref(`users`);
// 	userRef.on("value", (snapshot) => {
// 		res.json(snapshot.val());
// 	});
// })
// wss.on("connection", function (ws, req) {
// 	console.log("new client connected");
// 	let websocketProtocol = req.headers["sec-websocket-protocol"];
// 	let websocketProtocolArray = String(websocketProtocol).split('.');
// 	let clientProtocol = websocketProtocolArray[0].slice(0, 6);
// 	let username = websocketProtocolArray[1];

// 	let pairedUser;
// 	let user;
// 	if(clientProtocol == "device") {
// 		pairedUser = "mobile." + username;
// 		user = "device." + username;
// 		pair[user] = ws;
// 	}
// 	else if(clientProtocol == "mobile") {
// 		pairedUser = "device." + username;
// 		user = "mobile." + username;
// 		pair[user] = ws;
// 	}

// 	function aiPredict(ms) {
// 		return new Promise((resolve, reject) => {
// 			setTimeout(() => {
// 				// AI predict
// 				let predictResult = true;
// 				resolve(predictResult);
// 			}, ms);
// 		})
// 	}
	
// 	ws.on("message", async (message) => {
// 		console.log(`Message: ${message}`)
// 		if (clientProtocol == "device") {
// 			let predictResult = await aiPredict(3000);
// 			if (predictResult) {
// 				let ref = db.ref(`users/${username}`);
// 				let notiRef = ref.child("notification");
// 				notiRef.push({
// 					dateTime: message,
// 				});
// 				console.log("Storing data...");
// 				if(pair[pairedUser]) {
// 					pair[pairedUser].send(JSON.stringify({message: "Drowsiness Alert"}));
// 				}
// 				else {
// 					console.log("No connection")
// 				}
// 			}
// 			else {
// 				console.log('hi')
// 			}
// 		} else if (clientProtocol == "mobile") {
// 		}
// 	});

// 	ws.on("close", () => {
// 		console.log(`Disconnect! ${clientProtocol}.${username}`);
// 		delete pair[user];
// 	});
// });


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

