/*

	we boot the given warehouse module
	
*/
module.exports = function(config, supplychain, build){

	var reception = Reception(config);

	supplychain.mount_server('/reception', function(req, reply){
		reception(req, reply);
	})

	return reception;
}