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
var path = require('path');
var _ = require('lodash');
var telegraft = require('telegraft');
var SupplyChain = require('digger-supplychain');

/*

	the generic bootloader for a part of the digger network

	we build a connection back onto a reception server
*/

function ModuleBuilder(application_root){
	var self = this;
	
	/*
	
		where is the hq running
		
	*/
	this.hq_endpoints = {
		server:'tcp://' + (process.env.DIGGER_HQ_HOST || '127.0.0.1') + ':' + (process.env.DIGGER_HQ_SERVER_PORT || 8791),
		radio:'tcp://' + (process.env.DIGGER_HQ_HOST || '127.0.0.1') + ':' + (process.env.DIGGER_HQ_RADIO_PORT || 8792)
	}

	this.application_root = application_root;

	// used for when we boot the whole stack inline
	this.next_port = 8793;

	/*
	
		the only module we do not create a supplychain for is the telegraft hq
		
	*/
	if(this.type!='hq'){
		this.create_supplychain();
	}
}

util.inherits(ModuleBuilder, EventEmitter);

module.exports = ModuleBuilder;

ModuleBuilder.prototype.create_supplychain = function(type, config){
	var self = this;
	this.telegraft = telegraft.client(this.hq_endpoints);
	this.reception_socket = this.telegraft.rpcclient('/reception');
	this.supplychain = SupplyChain(function(req, reply){
		self.reception_socket.send(req, reply);
	})

	/*
	
		this is where a module might require a proxy directly onto anywhere in the network
		
		the reception uses this to route back to warehouse servers

		we are only returning the telegraft proxy which does the routing magic
		
	*/
	this.supplychain.get_proxy = function(){
		return self.telegraft.rpcproxy();
	}

	/*
	
		mount a function on the network 

	*/
	this.supplychain.mount_server = function(route, address, handler){

		if(arguments.length<=2){
			handler = address;
			address = null;
		}

		if(!handler){
			throw new Error('you need to pass a function to mount_server');
		}

		/*
		
			the address can be passed up by the module (in the case it is binding multiple places)

			otherwise we create it - either from the environment or defaults which increments the port each time
			
		*/
		address = address || 'tcp://' + (process.env.DIGGER_NODE_HOST || '127.0.0.1') + ':' + (process.env.DIGGER_NODE_PORT || self.next_port++);

		var server = self.telegraft.rpcserver({
			id:route + ':' + process.pid,
			protocol:'rpc',
			address:address
		})

		server.bind(route);

		server.on('request', function(req, reply){
			handler(req, reply);
		})
	}
}

/*

	the main object factory

	we pass the type and config

	if the type is 'code' then we are loading code from the application folder
	
*/
ModuleBuilder.prototype.compile = function(module, config){
	var self = this;
	config = config || {};
	config.hq_endpoints = this.hq_endpoints;

	var module_path = path.normalize(__dirname + '/modules/' + module + '.js');
	
	/*
	
		is the module actually code in the digger app
		
	*/
	if(module.match(/[\/\.]/)){
		module_path = path.normalize(this.application_root + '/' + module);
		if(module_path.indexOf(this.application_root)!=0){
			throw new Error('error - you cannot load code from above your application: ' + module_path);
		}
	}

	if(!fs.existsSync(module_path)){
		throw new Error(module_path + ' not found');
	}
	
	var factory = require(module_path);

	/*
	
		we pass the compile function to each module so they can include modules
		from the application codebase
		
	*/
	return factory(config, this.supplychain, function(path, config){
		/*
		
			we are building code from within a module - pass the path as code:
			
		*/
		console.log('-------------------------------------------');
		console.log('BUILD FROM WITHIN');
		return self.compile(path, config || {});
	})
}