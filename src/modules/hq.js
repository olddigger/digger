var telegraft = require('telegraft');

/*

	the main HQ is a telegraft server
	
*/
module.exports = function(config){

	var hq = telegraft.server(config.hq_endpoints);

	hq.on('worker.heartbeat', function(packet){
		console.log('-------------------------------------------');
		console.dir(packet);
	})

	return hq;
}