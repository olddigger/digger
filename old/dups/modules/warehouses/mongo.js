/*

	we boot the given warehouse module
	
*/
var Mongo = require('digger-mongo');

module.exports = function(config, $digger){
	var supplier = Mongo(config);

	return function(req, reply){
		
		supplier(req, function(error, answer){

			process.nextTick(function(){
				reply(error, answer);
			})
			
		});
	}
}