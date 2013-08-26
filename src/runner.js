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
var util = require('util');
var ejs = require('ejs');
var path = require('path');
var async = require('async');
var wrench = require('wrench');
var _ = require('lodash');
var Application = require('./application');
var ModuleBuilder = require('./modulebuilder');

function Runner(type){
	var self = this;
	this.type = type;
}

util.inherits(Runner, EventEmitter);

module.exports = Runner;

/*

	load the application and get setup
	
*/
Runner.prototype.load = function(application_root){
	var self = this;
	this.application_root = application_root;
	
	if(!fs.existsSync(this.application_root)){
		console.error(this.application_root + ' does not exist');
		process.exit();
	}

	this.db_path = path.normalize(this.application_root + '/.digger');

	if(!fs.existsSync(this.db_path)){
		wrench.mkdirSyncRecursive(this.db_path);
	}

	if(!fs.existsSync(this.db_path + '/build')){
		wrench.mkdirSyncRecursive(this.db_path + '/build');
	}

	this.app = new Application(this.application_root);
	this.builder = new ModuleBuilder(this.application_root);

  this.app.on('loaded', function(path){
  	
  	self.emit('loaded');

  })

  this.app.load();
}

/*

	run the whole stack in one process
	
*/
Runner.prototype.boot = function(application_root){
	var self = this;
	
	this.on('loaded', function(){

		/*
		
			we now loop through making each part of the stack
			
		*/
		console.log('-------------------------------------------');
		console.log('booting');

		async.series([

			/*
			
				services
				
			*/
			function(next){

				// we are booting locally and so assume services to be local also
				next();
			},

			/*
			
				HQ
				
			*/
			function(next){
				self.bootloader('hq', function(error, module){
					console.log('-------------------------------------------');
					console.log('HQ loaded');
					next();
				})
			},

			/*
			
				RECEPTION
				
			*/
			function(next){
				self.bootloader('/reception', function(error, module){
					console.log('-------------------------------------------');
					console.log('Reception loaded');
					next();
				})
			},

			/*
			
				then the warehouses
				
			*/
			function(next){
				async.forEachSeries(self.app.get_warehouses(), function(warehouse, nextwarehouse){
					self.bootloader(warehouse.id, function(error, module){
						console.log('-------------------------------------------');
						console.log('Warehouse: ' + warehouse.id + ' loaded');
						nextwarehouse();
					})
				}, next)
			},

			/*
			
				then the applications
				
			*/
			function(next){
				async.forEachSeries(self.app.get_apps(), function(app, nextapp){
					self.bootloader(app.id, function(error, module){
						console.log('-------------------------------------------');
						console.log('App: ' + app.id + ' loaded');
						nextapp();
					})
				}, next)
			}

		], function(error){

		})
	})

	this.load(application_root);
}

/*

	run a single part of the stack
	
*/
Runner.prototype.start = function(application_root, service){
	var self = this;
	
	this.on('loaded', function(){
		self.bootloader(service, function(error, module){
			console.log('-------------------------------------------');
			console.log('module running');
		})
	})

	this.load(application_root);
}

Runner.prototype.bootloader = function(service, done){
	var self = this;
	var desc = self.app.inspect(service);
	if(!desc){
		self.emit('error', 'service not found: ' + service);
		return;
	}

	var module = self.builder.compile(desc.module, desc);

	if(module && module.prepare){
		module.prepare(function(error){
			done(error, module);
		})
	}
	else{
		done(null, module);
	}
}