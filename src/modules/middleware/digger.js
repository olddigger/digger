/*

	we boot the given warehouse module
	
*/


module.exports = function(config, $digger){
	var www = $digger.www();
	return www.digger_application(config);
}