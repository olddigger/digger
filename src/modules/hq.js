var telegraft = require('telegraft');

/*

	the main HQ is a telegraft server
	
*/
module.exports = function(config){

	var hq = telegraft.server(config.hq_endpoints);

	var counter = 0;

	hq.on('worker.heartbeat', function(packet){
		counter++;
		console.log('-------------------------------------------');
		console.log(counter);
		console.dir(packet);
	})

	return hq;
}