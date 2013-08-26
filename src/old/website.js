var _ = require('lodash');
var Auth = require('./auth');
var Client = require('digger-client');
var fs = require('fs');

module.exports.build_websites = function(done){
	var self = this;

	// properties that are core to digger - everything else is a website
	var reserved_props = {
		name:true,
		reception:true,
		warehouses:true
	}
	
		// scoop up the websites in the digger.yaml
	for(var prop in this.doc){
		if(!reserved_props[prop]){

			var website_config = this.doc[prop];

			/*
	
				create a $digger that has it's requests flagged as internal and from a particular website
				
			*/
			var client = Client(function(req, reply){
				req.internal = true;
				req.website = prop;

				self.connector(req, reply);
			})


			/*
			
				build the website
				
			*/
			var website = this.build_website(this.digger.express, this.reception, client, website_config);

			this.websites[prop] = website;

			(website_config.domains || []).forEach(function(domain){
				self.emit('website', domain);

				/*
				
					register the domain using the main express vhost module
					(this will match the domain and serve that app)
					
				*/
				self.digger.register(domain, website);
			})
			
		}
	}

	done();
}

module.exports.build_website = function(express, reception, client, website_config){
	var self = this;

	/*
	
		create a sub-app for the website
		
	*/
	var website = express();

	var web_root = website_config.document_root;
	
	if(web_root){
		self.emit('www', web_root);
		website.use(express.static(web_root));
	}

	if(website_config.auth){

		var auth = Auth(client, website_config.auth);

		self.emit('auth', website_config.auth);

		website.use(website_config.auth.url || '/auth', auth);
	}

	/*
	
		mount the reception onto the website
		
	*/
	var digger_path = website_config.digger;
	if(digger_path){
		website.use(digger_path, reception);
	}


	function build_route(filepath){

	}

	/*
	
		create a module for each of the routes
		
	*/
	var routes = website_config.routes;

	if(routes){
		for(var route in routes){
			var modulename = routes[route];

			if(modulename){
				var config = {};

				if(typeof(module)==='object'){
					config = modulename;
					modulename = module.modulename;
				}

				if(!fs.existsSync(modulename)){
					throw new Error(modulename + ' does not exist');
				}

				/*
				
					the module is a single js
					
				*/
				if(modulename.match(/\.js$/)){
					self.emit('website:module', route, modulename);
					var module = self.build_module(modulename, config);

					website.use(route, module);
				}
				/*
				
					the module is a folder of js
					
				*/
				else{
					var files = fs.readdirSync(modulename) || [];

					files.forEach(function(file){
						var useroute = route + '/' + (file.replace(/\.js$/, ''));
						self.emit('website:module', useroute, modulename + '/' + file);
						var module = self.build_module(modulename + '/' + file, config);
						website.use(useroute, module);
					})
				}

				
			}
			
		}
	}

	return website;
}

8719
8720
8721