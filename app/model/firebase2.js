var admin = require("firebase-admin");
const serviceAccount = require("./max301esp-firebase-adminsdk-uwz8k-5156f416c0.json");

class firebase_admin2 {
    constructor() {
        this.admin = admin;
        this.admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://max301esp.firebaseio.com",
        });
    }
}

module.exports = firebase_admin2;