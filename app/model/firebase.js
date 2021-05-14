var admin = require("firebase-admin");
const serviceAccount = require("./drowsiness-test-firebase-adminsdk-2k9kw-c14c4dc702.json");


class firebase_admin {
    constructor() {
        this.admin = admin;
        this.admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://drowsiness-test-default-rtdb.firebaseio.com",
        });
    }
}

module.exports = firebase_admin;