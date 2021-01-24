const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signin = (req, res, db) => {
    var userRef = db.ref("users");
	let username = req.body.username;
	userRef.on("value", (snapshot) => {
		if (snapshot.child(username).exists()) {
			let specificUserRef = userRef.child(username);
			specificUserRef.once("value", (userData) => {
				let password = userData.val()["password"];
				var passwordIsValid = bcrypt.compareSync(req.body.password, password);
				if (!passwordIsValid) {
					return res.status(401).send({
						accessToken: null,
						message: "Invalid Password!",
					});
				}
				var token = jwt.sign({username: userData.key}, config.secret, {
					expiresIn: 86400, // 24 hours
				});

				res.status(200).send({
					username: userData.key,
					accessToken: token,
				});
			});
		} else {
			res.status(404).send({message: "User Not Found"});
		}
	});
};
