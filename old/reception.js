var Reception = require('digger-reception');
var utils = require('digger-utils');
var Telegraft = require('telegraft');

/*

	$digger is a supplychain back onto the network
	
*/
module.exports = function(config, endpoints){

	var telegraft = Telegraft.client(endpoints);
	var proxy_socket = telegraft.rpcproxy();

	/*
	
		the actual reception handler with contract resolver
		
	*/
	var reception = Reception(config);
	var id = utils.littleid();

	/*
	
		we are sending the request back to a warehouse

		we go via the telegraft proxy
		
	*/
	function run_request(req, reply){
    proxy.send(req.url, req, function(error, answer){
      process.nextTick(function(){
        reply(error, answer); 
      })
    })
	}

	var router;
		
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


	/*
	
		we have a backend request to deal with
		
	*/
	reception.on('digger:request', function(req, reply){
		
		if(router){
			router(req, function(error, answer){

				// the custom router has taken matters into it's own hands
				if(error){
					reception.emit('router:error', req, error);
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