/*

	we boot the given warehouse module
	
*/
var Static = require('digger-static');

module.exports = function(config, $digger){
	console.log('-------------------------------------------');
	console.log('making static');
	console.dir(config);

	if(config.folder){
		config.folder = $digger.filepath(config.folder);
	}

	if(config.file){
		config.file = $digger.filepath(config.file);
	}

	console.log('-------------------------------------------');
	console.dir(config);

	var supplier = Static(config);

	return supplier;
}