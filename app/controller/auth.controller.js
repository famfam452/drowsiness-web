const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signin = (req, res, db) => {
    var userRef = db.ref("users");
	let username = req.body.username;
	userRef.once("value", (snapshot) => {
		if (snapshot.child(username).exists()) {
			let specificUserRef = userRef.child(username);
			specificUserRef.once("value", (userData) => {
				let password = userData.val()["password"];
				var IsPasswordValid = bcrypt.compareSync(req.body.password, password);
				if (!IsPasswordValid) {
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

exports .changePassword = (req, res, db) => {
	let currentPassword = req.body.current_password;
	let newPassword = req.body.new_password;
	let confirmNewPassword = req.body.confirm_new_password;
	var userRef = db.ref("users");
	let username = req.username;
	userRef.once("value", (snapshot) => {
		if (snapshot.child(username).exists()) {
			let specificUserRef = userRef.child(username);
			specificUserRef.once("value", (userData) => {
				let isPasswordExist = bcrypt.compareSync(currentPassword, userData.val()['password'])
				if (isPasswordExist) {
					if (newPassword == confirmNewPassword) {
						newPassword = bcrypt.hashSync(newPassword);
						specificUserRef.update({password: newPassword});
						console.log("Successful change password");
						res.status(200).send({message: "Successful change password", status: 200})
					}
				}
				else {
					res.status(404).send({message: "Invalid Password", status: 404})
				}
			})
		}
	});
};
