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
		$digger.build(config._custommodule, {
			module:config._custommodule,
			config:config
		}, true) : 
		$digger.build('warehouses/' + config._systemmodule, {
			module:config._custommodule,
			config:config
		}, true);

	var logger = $digger.get_logger();

	/*
	
		setup the warehouse event listeners
		
	*/
	if(typeof(handler.on)==='function'){

		/*
		
			a select action has happened
			
		*/
		handler.on('digger:action', function(name, req, resultcount){
			logger.action(name, req, resultcount);
		})
/*
		handler.on('digger:provision', function(routes, resource){
			logger.provision(routes, resource);
		})
*/		
	}

	var rpcserver = $digger.rpc_server(config.id);
	
	rpcserver.use(config.id, function(req, reply){
		req.headers['x-supplier-route'] = config.id;

		process.nextTick(function(){
			console.dir(req);
			handler(req, function(error, answer){
				//console.log('-------------------------------------------');
				//console.dir(error);
				//console.dir(answer);
				reply(error, answer);
			});
		})
		
	})

	return handler;

}