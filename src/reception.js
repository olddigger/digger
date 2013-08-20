var _ = require('lodash');
var Reception = require('digger-reception');

var suppliers = {
	'mongo':require('digger-mongo'),
	'static':require('digger-static')
}

module.exports = function(reception_config){

	var self = this;

	var routes = {};
	var router = null;

	function setup(){

		var reception = Reception({
			routes:routes,
			router:router
		})

		/*
		
			now we create the suppliers with a client onto ourself
			
		*/
		reception.create_warehouses = function(warehouses, client){
			
			/*
			
				loop over the suplliers in the yaml file and build each one
				
			*/
			for(var route in warehouses){
				var warehouseobj = warehouses[route];
				var config = warehouseobj.config;

				if(warehouseobj.type.match(/\.js$/)){
					var warehouse = this.build_module(warehouseobj.type, config);
					reception.digger(route, warehouse);
				}
				else{
					if(!suppliers[warehouseobj.type]){
						throw new Error(warehouseobj.type + ' is not a recognized supplier');
					}	
					
					var warehouse = suppliers[warehouseobj.type](config);
					reception.digger(route, warehouse);
					self.emit('warehouse', route, warehouseobj);
				}
			}
		}

		/*
		
			connect the reception socket handler with the front end .io
			
		*/
		reception.connect_sockets = function(io){
			io.sockets.on('connection', reception.socket_connector());
		}

		return reception;	
	}

	/*
	
		build the reception router out of user supplied code
		
	*/
	if(reception_config.router){
		router = this.build_module(reception_config.router);
	}

	return setup();
}