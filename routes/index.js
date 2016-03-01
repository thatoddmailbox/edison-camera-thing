var express = require('express');
var router = express.Router();

var sys = require('sys')
var exec = require('child_process').exec;

var roux = require("../roux");

var takePicture = function(folder, name, done, err) {
    var command = "/home/root/bin/ffmpeg/ffmpeg -s 1920x1080 -f video4linux2 -i /dev/video0 -vframes 1 ";
    command += "\"";
    command += folder; // I know, command injection. But this should be trusted input, so.
    command += name;
    command += "\"";
    exec(command, function(error, stdout, stderr) {
        if (error !== null) {
            err(error);
            return;
        }
        if (stdout.indexOf("muxing overhead: unknown") > -1) {
            done()
        }
    });
};

var getPictureFn = function() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ".jpeg";
};

router.get("/", global.verifyLogin, function(req, res, next) {
    res.render("index", { title: "Edison Camera Thing" });
});

router.get("/force-picture", global.verifyLogin, function(req, res, next) {
    takePicture("/home/root/camera/forced-pictures/", getPictureFn(), function() {
        res.end("Done!");
    }, function(err) {
        console.error(err);
        res.end("Error taking picture!");
    });
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

        res.redirect("/");
    });
});

router.get("/logout", global.verifyLogin, function(req, res, next) {
    res.session.loggedIn = false;
    res.redirect("/");
});

module.exports = router;
