var telegraft = require('telegraft');

/*

	the main HQ is a telegraft server
	
*/
module.exports = function(endpoints){

	var hq = telegraft.server(endpoints);

	return hq;
}