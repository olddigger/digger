/*

	$digger is a supplychain back onto the network
	
*/

var fs = require('fs');
var path = require('path');

module.exports = function(config, $digger){
	
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

	if(typeof(domains)==='string'){
		domains = [domains];
	}

	/*

	app.use(function(req, res, next){
		req.website = config.id;
		next();
	})
*/

	/*
	
		MIDDLEWARE
		
	*/

	var middleware = config.middleware || {};

	if(config.digger){
		if(typeof(config.digger)==='string'){
			config.digger = {
				route:config.digger
			}
		}
		config.digger.module = 'digger';
		middleware[config.digger.route] = config.digger;
	}

	function build_middleware(route, modulename, middleware_config){
		var middleware = $digger.build(modulename, {
			config:middleware_config
		}, true);
		app.use(route, middleware);
		console.log('website module: ' + route + ' -> ' + modulename);
	}

	for(var route in middleware){
		var middleware_settings = middleware[route];
		if(typeof(middleware_settings)==='string'){
			middleware_settings = {
				module:middleware_settings
			}
		}
		var middleware_config = middleware_settings.config || {};
		middleware_config.id = route;
		
		var module = middleware_settings.module;

		if(!module){
			console.error('the middleware must define a module');
			process.exit();
		}


		/*
		
			it is code in the app - 
			
		*/
		if(module.match(/[\/\.]/)){

			module = $digger.filepath(module);
			
			if(module.match(/\.js$/)){
				build_middleware(route, module, middleware_config);
			}
			else{
				var files = fs.readdirSync($digger.filepath(module)) || [];

				files.forEach(function(file){
					var useroute = route + '/' + (file.replace(/\.js$/, ''));
					build_middleware(useroute, module + '/' + file, middleware_config);					
				})
			}
		}
		/*
		
			it is a digger module
			
		*/
		else{
			build_middleware(route, 'middleware/' + module, middleware_config);
		}
	}
	


	/*
	
		mount the static file handler
		
	*/
	app.use(www.express.static(config.document_root));

	/*
	
		tell the main HTTP server that we have a website with these domains
		
	*/
	www.add_website(domains, app);
	
	return app;
}