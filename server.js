//BASE SETUP
//==============================

//CALL THE PACKAGES
var express = require('express');  //call express
var app = express();  // define our app using express
var bodyParser = require('body-parser'); //get body-parser
var morgan = require('morgan');  //used to see requests
var mongoose = require('mongoose');  //for working with our database
var port = process.env.PORT || 8080;
var User = require('./app/models/users');

//Stopped on page 65

// connect to our database (hosted on modulus.io)
mongoose.connect('mongodb://node:noder@novus.modulusmongo.net:27017/Iganiq8o');

//APP CONFIGURATION -------------
//use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded( {extend: true} ));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
		Authorization');
	next();
});

//log all requests to the console
app.use(morgan('dev'));

//Routes for our APIs
//==============================
var apiRouter = express.Router();  //get an instance of the Router

//middleware to use for all requests
apiRouter.use(function (req, res, next) {
	//do logging
	console.log('Somebody just came to our app');
	//we'll and more to the middle in Chapter 10
	//this is where we will authenticate users
	next(); //make sure we go to the next routes and don't stop here
});

//test route to make sure everything is working
//accessed at GET http://localhost:8080/api)
apiRouter.get('/', function (req, res) {
	res.json({ message: 'Welcome to our api'});
});

//Basic route for the home page
app.get('/', function (req, res) {
	res.send('Welcome to the home page');
});

//on routes that end in /users
//-----------------------------------
apiRouter.route('/users')

	// create a user (accessed at POST http://localhost:8080/users)
	.post(function(req, res) {
		
		var user = new User();		// create a new instance of the User model
		user.name = req.body.name;  // set the users name (comes from the request)
		user.username = req.body.username;  // set the users username (comes from the request)
		user.password = req.body.password;  // set the users password (comes from the request)

		user.save(function(err) {
			if (err) {
				console.log(err);
				// duplicate entry
				if (err.code == 11000) 
					return res.json({ success: false, message: 'A user with that username already exists. '});
				else 
					return res.send(err);
			}

			// return a message
			res.json({ message: 'User created!' });
		});

	})

	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res){
		User.find(function(err, users){
			if(err){
				res.send(err);
			}
			res.json(users);
		});
	});

//on routes that end in /users/:user_id
//---------------------------------------
apiRouter.route('/users/:user_id')
	//get the user with that id
	//accessed at GET http://localhost:8080/users/:user_id)
	.get(function(req, res){
		User.findById(req.params.user_id, function (err, user){
			if(err){
				res.send(err);
			}
			res.json(user);
		});
	})
	//update the user with this id
	//accessed at PUT http://localhost:8080/api/users/:user_id
	.put(function (req, res){
		//use our user model to find the user we want
		User.findById(req.params.user_id, function (err, user){
			if (err) res.send(err);

			if(req.params.name) user.name = req.params.name;
			if(req.params.username) user.username = req.params.username;
			if(req.params.password) user.name = req.params.password;

			user.save(function(err){
				if(err) res.send(err);

				//return a message
				res.json({message: 'User has been updated'});
			});
		});
	})

//more routes for our API will go here

//REGISTER OUR Routes-----------------------------
//all of our routes will be prefixed with /api
app.use('/api', apiRouter);

//START THE SERVER
app.listen(port);
console.log('Listening on port ' + port);
