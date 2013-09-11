var goauth = require('goauth');

module.exports = function(config, $digger){
	var self = this;

	config = config || {};

	if(!config.warehouse){
		throw new Error('auth module requires a warehouse option')
	}

	/*

			connect to the backend warehouse that contains our users
		
	*/
	var userwarehouse = $digger.connect(config.warehouse);

	/*
	
		load the user with the given username to use for login and register check
		
	*/
	function load_user(username, callback){
		/*
		
			load the user based on the username -> id
			
		*/
		userwarehouse('user[username=' + username + ']')
			.ship(function(user){
				if(user.isEmpty()){
					callback('no user found');
				}
				else{
					callback(null, user);
				}
			})
			.fail(function(error){
				callback(error);
			})
	}

	/*
	
		insert a new user into the warehouse
		
	*/
	function create_user(data, callback){

		data._password = data.password;
		delete(data.password);

		var user = $digger.container('user', data);

		userwarehouse
			.append(user)
			.ship(function(){
				callback(null, user.get(0));
			})
			.fail(function(error){
				callback(error);
			})
		
	}

	/*
	
		the goauth setup
		
	*/
	var auth = goauth(config);

	auth.on('login', function(data, callback){

		load_user(data.username, function(error, user){
			if(error || !user || user.attr('_password')!=data.password){
				callback('invalid details');
			}
			else{
				callback(null, user.get(0));
			}
		})

	})

	auth.on('register', function(data, callback){
		load_user(data.username, function(error, user){

			if(!error || user){
				callback('user ' + data.username + ' already exists')
				return;
			}

			create_user(data, callback);

		})
	})

	auth.on('update', function(user, data, callback){
		console.log('-------------------------------------------');
		console.log('loading user');
		load_user(user.username, function(error, user){

			console.log('-------------------------------------------');
			console.log('user loaded');
			console.dir(error);

			if(!user){
				error = 'no user found';
			}

			if(error){
				callback(error);
				return;
			}

			for(var prop in data){
				user.attr(prop, data[prop]);
			}

			console.log('-------------------------------------------');
			console.log('saving user');

			user
				.save()
				.ship(function(){
					callback(null, true);
				})
				.fail(function(error){
					callback(error);
				})

		})
	})

	return auth;
}