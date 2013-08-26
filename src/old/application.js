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
var path = require('path');
var _ = require('lodash');
var util = require('util');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var ErrorHandler = require('./errorhandler');
var Config = require('./config');

//var DiggerServe = require('digger-serve');
//var Client = require('digger-client');

module.exports = Application;

function Application(application_root){
	var self = this;
	this.websites = {};
	this.application_root = path.normalize(application_root);
	this.config = new Config(this.application_root);

	this.config.on('loaded', function(path){
		self.emit('loaded', path);
	})

	this.config.on('data', function(data){
		self.emit('data', data);
	})

	this.config.on('node', function(data){
		self.emit('node', data);
	})
}

util.inherits(Application, EventEmitter);

Application.prototype.load = function(done){

	var self = this;
	
	async.series([
		function(next){
			self.config.load(next);
		}

	], done)

}

/*
Application.prototype.bootstrap = function(port, doc, done){
	var self = this;

	this.doc = doc;
	this.digger = DiggerServe();

	this.reception = this.build_reception(this.doc.reception);

	this.connector = this.reception.connector();

	this.reception.create_warehouses(this.doc.warehouses, this.connector);
	this.reception.connect_sockets(this.digger.io);

	this.digger.app.use(this.digger.app.router);
	this.digger.app.use('/__digger/assets', this.digger.express.static(path.normalize(__dirname + '/../assets')));
	this.digger.app.use(ErrorHandler());

	this.digger.server.listen(port, function(){
		self.emit('loaded', doc);
		done();
	});
}

Application.prototype.start = function(port, done){
	var self = this;
	
	this.load_config(function(error, doc){

		self.bootstrap(port, doc, function(){
			self.build_websites(done);
		});
	})

}

Application.prototype.build_reception = require('./reception');
Application.prototype.build_websites =require('./website').build_websites; 
Application.prototype.build_website = require('./website').build_website;

Application.prototype.filepath = function(pathname){
	if(pathname.indexOf('/')!=0){
		pathname = path.normalize(this.root_path + '/' + pathname);
	}
	return pathname;
}

Application.prototype.build_module = function(path, config){
	var self = this;
	var module_path = this.filepath(path);
	var module = null;


	var client = Client(function(req, reply){
		req.internal = true;
		self.connector(req, reply);
	})

	try{
		var ModuleClass = require(module_path);
		module = ModuleClass(config, client);
	}
	catch (e){
		throw e;
	}

	return module;
}
*/