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
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var ejs = require('ejs');
var path = require('path');
var _ = require('lodash');

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

	if(config.type==='mongo'){
		ret.mongo = true;
	}

	return ret;
}

/*

	returns a list of the services required for the given app config
	
*/
function app_services(config){
	return {
		
	};
}

function Config(folder){
	this.folder = folder;
	this.config_path = path.normalize(this.folder + '/digger.yaml');

	if(!fs.existsSync(this.config_path)){
		throw new Error(this.config_path + ' does not exist');
	}

	this.nodes = {};
	this.services = {
		/*
		
			every stack gets a redis and hq
			
		*/
		redis:true
	};
}

util.inherits(Config, EventEmitter);

module.exports = Config;

Config.prototype.filepath = function(pathname){
	if(pathname.indexOf('/')!=0){
		pathname = path.normalize(this.folder + '/' + pathname);
	}
	return pathname;
}

Config.prototype.add_warehouse = function(config){
	config._diggermodule = config.id=='/reception' ? 'reception' : 'warehouse';
	if(config._diggermodule=='reception'){
		config.module = 'reception';
	}
	this.nodes[config.id] = config;
	this.services = _.extend(this.services, warehouse_services(config));
}

Config.prototype.add_app = function(config){
	config._diggermodule = 'app';
	config.module = 'app';
	this.nodes[config.id] = config;
	this.services = _.extend(this.services, app_services(config));
}

Config.prototype.load = function(done){
	var self = this;
	var yamlstring = fs.readFileSync(this.config_path, 'utf8');

	yamlstring = ejs.render(yamlstring, {
		path:function(st){
			return self.filepath(st);
		}
	})

  var doc = yaml.safeLoad(yamlstring);

  this.data = doc;

  _.each(doc, function(config, id){

  	config.id = id;

  	/*
  	
  		warehouses begin with a slash
  		
  	*/
  	if(id.charAt(0)==='/'){
  		self.add_warehouse(config);
  	}
  	/*
  	
  		otherwise it's an app
  		
  	*/
  	else{
  		self.add_app(config);
  	}
  })

  /*
  
  	auto inject the reception warehouse
  	
  */
  if(!self.nodes['/reception']){
  	self.add_warehouse({
  		id:'/reception',
  		module:'reception'
  	})
  }

  this.emit('data', doc);

  // extract the services we will need
  _.each(self.services, function(service, name){
  	self.emit('service', name);
  })

	_.each(self.nodes, function(config){
		self.emit('node', {
  		type:config._diggermodule,
  		config:config
  	})
  })

  this.emit('loaded', this.config_path);

  done();
}