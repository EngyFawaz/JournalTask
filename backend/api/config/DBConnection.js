var mongoose = require("mongoose"),
	config = require("../config/index"),
	dburl = config.MONGO_URI;

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
var gracefulShutdown = function(callback) {
	mongoose.connection.close(function(err) {
		callback(err);
	});
};

// For nodemon restarts
process.once("SIGUSR2", function() {
	gracefulShutdown(function(err) {
		if (err) {
			return console.error(err);
		}
		console.log("nodemon restart");
		process.kill(process.pid, "SIGUSR2");
	});
});

// For app termination
process.on("SIGINT", function() {
	gracefulShutdown(function(err) {
		if (err) {
			return console.error(err);
		}
		console.log("App termination (SIGINT)");
		process.exit(0);
	});
});

mongoose.connect(dburl, { useUnifiedTopology: true, useNewUrlParser: true } , function(err) {
	if (!err) {
		return console.log("Successfully connected to the database");
	}
	console.error(err);
	gracefulShutdown(function(err) {
		if (err) {
			return console.error(err);
		}
		console.log("Could not connect to database");
		process.exit(0);
	});
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

require("../models/article.model");
