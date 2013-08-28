var Reception = require('digger-reception');

/*

	$digger is a supplychain back onto the network
	
*/
module.exports = function(config, $digger){

	/*
	
		the actual reception handler with contract resolver
		
	*/
	var reception = Reception(config);

	/*
	
		the backend proxy so we don't have to keep track of servers
		
	*/
	var proxy = $digger.get_proxy();
	var logger = $digger.get_logger();

	/*
	
		we are sending the request back to a warehouse

		we go via the telegraft proxy
		
	*/
	function run_request(req, reply){
		logger.request(req);
		proxy.send(req.url, req, function(error, answer){
			reply(error, answer);
		});
	}

	/*
	
		are we running via a user defined router?
		
	*/
	if(config.router){
		if(typeof(config.router)==='string'){
			config.router = {
				module:config.router,
				config:{}
			}
		}
		console.log('mounting reception router: ' + config.router.module);
		router = $digger.build($digger.filepath(config.router.module), config.router.config, true);
	}

	$digger.mount_server('/reception', function(req, reply){
		reception(req, reply);
	})

	/*
	
		there is a contract resolving
		
	*/
	reception.on('digger:reception', function(req, reply){
		logger.reception(req);
	})

	/*
	
		we have a backend request to deal with
		
	*/
	reception.on('digger:request', function(req, reply){
		if(router){
			router(req, function(error, answer){
				/*
	
					the custom router has taken matters into it's own hands
					
				*/
				if(error){
					logger.error(req, error);
				}
				reply(error, answer);
			}, function(){
				// this must be a function with no args as it is the next() for the router
				run_request(req, reply);
			});
		}
		else{
			run_request(req, reply);
		}
	})

	return reception;
}