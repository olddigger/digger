var Reception = require('digger-reception');

/*

	$digger is a supplychain back onto the network
	
*/
module.exports = function(config, supplychain, build){

	/*
	
		the actual reception handler with contract resolver
		
	*/
	var reception = Reception(config);

	/*
	
		the backend proxy so we don't have to keep track of servers
		
	*/
	var proxy = supplychain.get_proxy();

	/*
	
		we are sending the request back to a warehouse

		we go via the telegraft proxy
		
	*/
	function run_request(req, reply){
		console.log('-------------------------------------------');
		console.log('sending');
		console.dir(req);
		proxy.send(req.url, req, reply);
	}

	/*
	
		are we running via a user defined router?
		
	*/
	if(config.router){
		router = build(config.router);
		router({test:10}, function(){})
	}

	supplychain.mount_server('/reception', function(req, reply){
		reception(req, reply);
	})

	/*
	
		we have a backend request to deal with
		
	*/
	reception.on('request', function(req, reply){
		if(router){
			console.log('-------------------------------------------');
			console.log('routing');
			console.dir(req.url);
			router(req, reply, run_request);
		}
		else{
			run_request(req, reply);
		}
	})

	return reception;
}