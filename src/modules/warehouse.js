/*

	we boot the given warehouse module
	
*/
module.exports = function(config, $digger){

	var module = config.module;
	var warehouseconfig = config.config || {};

	// remove this or we get into a loop
	delete(config._diggermodule);

	var handler;

	/*
	
		are we building custom code
		
	*/
	if(config._custommodule){
		handler = $digger.build(config._custommodule, config, true);
	}
	/*
	
		or including a standard module
		
	*/
	else{
		var factory = require('./warehouses/' + module);
		handler = factory(warehouseconfig, $digger);
	}

	console.log('-------------------------------------------');
	console.log('mounting warehouse: ' + config.id);

	$digger.mount_server(config.id, function(req, reply){
		handler(req, reply);
	})

	return handler;

}