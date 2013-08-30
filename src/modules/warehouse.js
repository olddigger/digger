/*

	we boot the given warehouse module
	
*/
var path = require('path');

module.exports = function(config, $digger){

	var module = config.module;

	/*
	
		are we building custom code
		
	*/

	var compileconfg = {

	}
	
	var handler = config._custommodule ? 

		// the warehouse is some user code
		$digger.build(config._custommodule, {
			module:config._custommodule,
			config:config
		}, true) : 

		// the warehouse is a digger one
		$digger.build('warehouses/' + config._systemmodule, {
			module:config._custommodule,
			config:config
		}, true);

	/*
	
		setup the warehouse event listeners
		
	*/
	if(typeof(handler.on)==='function'){

		var logger = $digger.get_logger();

		/*
		
			a select action has happened
			
		*/
		handler.on('digger:action', function(name, req, resultcount){
			logger.action(name, req, resultcount);
		})
		
	}

	/*
	
		mount the warehouse on the network
		
	*/
	var route = config.id;
	var server = $digger.rpc_server(route);

	server.on('request', function(req, reply){
		req.headers = req.headers || {};
		req.headers['x-supplier-route'] = route;
		req.url = req.url.substr(route.length);
		process.nextTick(function(){
			handler(req, function(error, answer){
				reply(error, answer);
			})
		})

	})
	
	return handler;

}