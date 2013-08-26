/*

	we boot the given warehouse module
	
*/
var Mongo = require('digger-mongo');

module.exports = function(config, supplychain, build){
	var supplier = Mongo(config);

	return supplier;
}