/*

  (The MIT License)

  Copyright (C) 2005-2013 Kai Davenport

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */


/**
 * Module dependencies.
 */



var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var utils = require('digger-utils');
var Client = require('digger-client');
var Build = require('./build');

module.exports = function get_digger(options, handler){

  options = options || {};

  /*
  
    the route back to reception via a supply-chain
    
  */
  var $digger = Client(handler);

  $digger = _.extend($digger, options);

  $digger.build = function(){
    var args = utils.toArray(arguments);

    args.unshift($digger);

    return Build.apply(null, args);
  }

  $digger.filepath = function(filepath){
    if(filepath.indexOf('/')==0){
      return filepath;
    }
    return path.normalize(options.application_root + '/' + filepath);
  }

  return $digger;
}
