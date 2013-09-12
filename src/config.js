/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

/*
  Module dependencies.
*/
var fs = require('fs');
var yaml = require('js-yaml');
var wrench = require('wrench');
var path = require('path');

/*

	returns a list of the services required for the given warehouse config

	e.g.

		INPUT

			{
				type:mongo
			}

		OUTPUT

		{
			mongo:true
		}
	
*/
function warehouse_services(config){
	var ret = {
		
	};

	if(config.module==='mongo'){
		ret.mongo = true;
	}

	return ret;
}

/*

	returns a list of the services required for the given app config
	
*/
function app_services(config){
	var ret = {
		
	};

	// if the app has middleware - we assume they will want a redis cache
	if(config.middleware && Object.keys(config.middleware).length>0){
		ret.redis = true;
	}

	return ret;
}

module.exports = function(application_root){
	var config_path = path.normalize(application_root + '/digger.yaml');

	if(!fs.existsSync(config_path)){
		console.error(config_path + ' does not exist');
		process.exit();
	}

	var apps = {};
	var warehouses = {};
	var reception = {};
	var services = {
		
	};

	function add_warehouse(id, config){
		if(id=='/reception'){
			reception = config;
		}
		else{
			warehouses[id] = config;
			var addservices = warehouse_services(config);
			for(var prop in addservices){
				services[prop] = addservices[prop];
			}
		}
	}

	function add_app(id, config){
		apps[id] = config;

		var addservices = app_services(config);
		for(var prop in addservices){
			services[prop] = addservices[prop];
		}
	}

	var yamlstring = fs.readFileSync(config_path, 'utf8');

  var doc = yaml.safeLoad(yamlstring);

  for(var id in doc){
  	var config = doc[id];

  	/*
  	
  		warehouses begin with a slash
  		
  	*/
  	if(id.charAt(0)==='/'){
  		add_warehouse(id, config);
  	}
  	/*
  	
  		otherwise it's an app
  		
  	*/
  	else{
  		add_app(id, config);
  	}
  }

  add_warehouse = null;
  add_app = null;
  doc = null;

  return {
  	application_root:application_root,
  	services:services,
  	reception:reception,
  	warehouses:warehouses,
  	apps:apps
  }
}