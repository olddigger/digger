/*

	a function that creates a singleton RPC server

	and mounts
	
*/
module.exports = function(modulebuilder){
	var self = modulebuilder;
	/*
	
		the http server we mount our apps onto

		this might not be created - only for front end web apps
		
	*/
	var www = null;
	return function(){
		if(!www){
			var Server = require('digger-serve');
			www = Server();

			var port = (process.env.DIGGER_NODE_PORT || 80);

			www.server.listen(port, function(){
				console.log('www server listening on port: ' + port);
			})

			// feed the request down the supplychain
			www.app.on('digger:request', function(req, reply){

				/*
				
					it is very important that we pass to external_handler here

					this passes ONLY:

						method
						url
						headers
						body
					
				*/
				self.external_handler(req, reply);
			})
		}

		return www;
	}
}