var telegraft = require('telegraft');

/*

	the main HQ is a telegraft server
	
*/
module.exports = function(config){

	var hq = telegraft.server(config.hq_endpoints);

	return hq;
}