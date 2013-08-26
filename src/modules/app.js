/*

	$digger is a supplychain back onto the network
	
*/
module.exports = function(config, $digger){
	console.log('-------------------------------------------');
	console.log('running app');
	
	if(config.document_root){
		config.document_root = $digger.filepath(config.document_root);
	}

	/*
	
		this produces a nice new express app and bootstraps the HTTP server
		holding it (+ sockets & redis sessions)
		
	*/
	var www = $digger.www();
	var app = www.express();

	var domains = config.domains || [];

	www.add_website(domains, app);
	
	return app;
}