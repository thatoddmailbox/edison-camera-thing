var express = require('express');
var router = express.Router();

router.get("/", global.verifyLogin, function(req, res, next) {
    res.render("index", { title: "Edison Camera Thing" });
});

router.get("/login", function(req, res, next) {
    res.render("login", { title: "Log in" });
});

router.post("/login", function(req, res, next) {
    res.render("login", { title: "Log in" });
});

router.get("/logout", global.verifyLogin, function(req, res, next) {
    res.session.loggedIn = false;
    res.redirect("/");
});

module.exports = router;
