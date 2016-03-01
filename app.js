var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var serveIndex = require('serve-index');

var session = require('express-session');
var FileStore = require('session-file-store')(session);

global.mraa = require('mraa');
var ili9341 = require('jsupm_ili9341');
global.lcd = new ili9341.ILI9341(10, 1, 9, 14);
global.backlightPin = new mraa.Gpio(5);

backlightPin.dir(mraa.DIR_IN);
//lcd.fillScreen(lcd.color565(255, 255, 255));

global.verifyLogin = function(req, res, next) {
    if (req.session.username && req.session.loggedIn) {
        res.locals.username = req.session.username;
        next();
    } else {
        res.redirect("/login");
    }
};

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sess = {
	store: new FileStore({}),
	secret: 'keyboard cat',
	cookie: {}
};

app.use(session(sess));

app.use("/", routes);
app.use("/failed-uploads", global.verifyLogin, serveIndex("/home/root/camera/failed-uploads", {'icons': true}), express.static("/home/root/camera/failed-uploads"));
app.use("/forced-pictures", global.verifyLogin, serveIndex("/home/root/camera/forced-pictures", {'icons': true}), express.static("/home/root/camera/forced-pictures"));
app.use("/tmp", global.verifyLogin, serveIndex("/home/root/camera/tmp", {'icons': true}), express.static("/home/root/camera/tmp"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

if (!String.prototype.encodeHTML) {
	String.prototype.encodeHTML = function () {
		return this.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&apos;');
	};
}

module.exports = app;
