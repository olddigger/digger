/*

	we boot the given warehouse module
	
*/


module.exports = function(config, $digger){
	return $digger.www.digger_application(config);
}