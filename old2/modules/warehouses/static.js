/*

	we boot the given warehouse module
	
*/
var Static = require('digger-static');

module.exports = function(config, $digger){

	var staticconfig = config || {};

	if(staticconfig.folder){
		staticconfig.folder = $digger.filepath(staticconfig.folder);
	}

	if(staticconfig.file){
		staticconfig.file = $digger.filepath(staticconfig.file);
	}

	return Static(staticconfig);
}