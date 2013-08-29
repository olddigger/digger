var Reception = require('digger-reception');
var utils = require('digger-utils');

/*

	$digger is a supplychain back onto the network
	
*/
module.exports = function(config, $digger){

	/*
	
		the actual reception handler with contract resolver
		
	*/
	var reception = Reception(config);

	var id = utils.littleid();

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
			process.nextTick(function(){
				reply(error, answer);	
			})
			
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

	var rpcserver = $digger.rpc_server('/reception');

	/*
	
		the main entry point for anything coming from a web application
		
	*/
	rpcserver.use(function(req, res, next){

		// this is a hack only for when we are running everything is one process (i.e. digger run)
		// that is because our rpcserver is the same warehouse for the whole stack
		// and requests will loop through here repeatedly unless passed onto the further handlers down the line
		if(req.headers['x-reception']){
			next();
			return;
		}
		else{
			req.headers['x-reception'] = id;
			reception(req, res);
		}
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

				// the custom router has taken matters into it's own hands
				if(error){
					logger.error(req, error);
				}
				process.nextTick(function(){
					reply(error, answer);	
				})
				
			}, function(){
				process.nextTick(function(){
					// this must be a function with no args as it is the next() for the router
					run_request(req, reply);
				})
				
			});
		}
		else{
			run_request(req, reply);
		}

	})

	return reception;
}