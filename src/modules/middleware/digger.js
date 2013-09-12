/*

	we boot the given warehouse module
	
*/


module.exports = function(config, $digger){
	return $digger.digger_middleware(config);
}