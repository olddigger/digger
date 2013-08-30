/*

	a function that creates a singleton RPC server

	and mounts
	
*/
var Warehouse = require('digger-warehouse');
var utils = require('digger-utils');

module.exports = function(modulebuilder){
	var self = modulebuilder;

	return function(route){

		/*
		
			the address can be passed up by the module (in the case it is binding multiple places)

			otherwise we create it - either from the environment or defaults which increments the port each time
			
		*/

		var address = 'tcp://' + (process.env.DIGGER_NODE_HOST || '127.0.0.1') + ':' + (process.env.DIGGER_NODE_PORT || self.next_port++);

		var server = self.telegraft.rpcserver({
			id:utils.littleid(),
			protocol:'rpc',
			address:address
		})

		console.log('binding telegraft server: ' + route + ' -> ' + address);

		/*
		
			this announces us to the network
			
		*/
		server.bind(route);

		return server;
	}
}