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
var EventEmitter = require('events').EventEmitter;
//var util = require('util');
//var path = require('path');

var utils = require('digger-utils');
var path = require('path');

module.exports = build;

/*

	the main object factory

	we pass the type and config

	if the type is 'code' then we are loading code from the application folder
	
*/
function build($digger, module, moduleconfig, custom_module){
	moduleconfig = moduleconfig || {};
	config = moduleconfig.config || {};	

	var module_path = '';

	if(custom_module){
		module_path = module;

		if(module.match(/[\/\.]/) && module.indexOf('/')!=0){
			module_path = path.normalize(__dirname + '/modules/' + module + '.js');
		}
	}
	else{
		module_path = path.normalize(__dirname + '/modules/' + module + '.js');

		/*
		
			is the module actually code in the digger app
			
		*/
		if(module.match(/[\/\.]/)){
			module_path = path.normalize($digger.application_root + '/' + module);
			config._custommodule = module_path;
			if(module_path.indexOf($digger.application_root)!=0){
				console.error('error - you cannot load code from above your application: ' + module_path);
				process.exit();
			}
		}
		else{
			config._systemmodule = module;
		}

		/*
		
			this means we have custom code but should load it inside of a warehouse module
			
		*/
		if(moduleconfig._diggermodule){
			module_path = path.normalize(__dirname + '/modules/' + moduleconfig._diggermodule + '.js')
		}
	}
	

	if(!fs.existsSync(module_path)){
		console.error(module_path + ' not found');
		process.exit();
	}

	var factory = require(module_path);

	/*
	
		we pass the compile function to each module so they can include modules
		from the application codebase
		
	*/
	var pass_config = utils.extend({
		id:moduleconfig.id
	}, config);

	// remove this or we get into a loop
	delete(pass_config._diggermodule);
	
	return factory(pass_config, $digger);
}