/*

	we boot the given warehouse module
	
*/
var Mongo = require('digger-mongo');

module.exports = function(config, $digger){
	return Mongo(config);
}