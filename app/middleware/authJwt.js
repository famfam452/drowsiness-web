const config = require("../config/auth.config.js");
var jwt = require("jsonwebtoken");

exports .verifyToken = (req, res, next) => {
	let token = req.headers["x-access-token"];
	if (!token) {
		return res.status(403).send({message: "No token provided!", status: 403});
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
			return res.status(401).send({message: "Unauthorized!"});
		}
        req.username = decoded.username;
		next();
	});
};