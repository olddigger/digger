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
var Config = require('./config');

//var DiggerServe = require('digger-serve');
//var Client = require('digger-client');

module.exports = Application;

function Application(application_root){
	var self = this;
	this.websites = {};
	this.application_root = path.normalize(application_root);
	this.config = new Config(this.application_root);
	this.config.load();
}

util.inherits(Application, EventEmitter);

Application.prototype.inspect = function(name){
	var self = this;
	if(name=='hq'){
		return {
			module:'hq'
		}
	}
	return self.config.nodes[name];
}

Application.prototype.get_services = function(){
	return _.keys(this.config.services);
}

Application.prototype.get_nodes = function(){
	return _.values(this.config.nodes);
}

Application.prototype.get_warehouses = function(){
	return _.filter(this.get_nodes(), function(node){
		return node._diggermodule==='warehouse';
	})
}

Application.prototype.get_apps = function(){
	return _.filter(this.get_nodes(), function(node){
		return node._diggermodule==='app';
	})
}