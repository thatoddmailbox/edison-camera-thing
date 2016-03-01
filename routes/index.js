var express = require('express');
var router = express.Router();

var roux = require("../roux");

router.get("/", global.verifyLogin, function(req, res, next) {
    res.render("index", { title: "Edison Camera Thing" });
});

router.get("/login", function(req, res, next) {
    res.render("login", { title: "Log in" });
});

router.post("/login", function(req, res, next) {
    if (req.body.username == undefined || req.body.password == undefined) {
        res.render("login", { title: "Log in", error: "All fields are required." });
        return;
    }
    var username = req.body.username;
	var password = req.body.password;

	var dataStr = "";
	dataStr += "<credentials><username>";
	dataStr += username.encodeHTML();
	dataStr += "</username><password type=\"plaintext\">";
	dataStr += password.encodeHTML();
	dataStr += "</password></credentials>";

	roux.request("", "authenticate", dataStr, function(err) {
        res.render("login", { title: "Log in", error: "Invalid username/password combination." });
	}, function(data) {
		var key = data["response"]["result"][0]["key"][0]["_"];
		var owner = data["response"]["result"][0]["key"][0]["$"]["owner"];

        if (username != "c19as3") {
            res.render("login", { title: "Log in", error: "You do not have permission to access this camera! If you believe this is in error, please contact Alexander Studer." });
            return;
        }

        req.session.username = username;
        req.session.loggedIn = true;
    });
});

router.get("/logout", global.verifyLogin, function(req, res, next) {
    res.session.loggedIn = false;
    res.redirect("/");
});

module.exports = router;
