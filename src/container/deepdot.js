/*

  (The MIT License)

  Copyright (C) 2005-2013 Kai Davenport

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var _ = require('lodash');
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;

module.exports = deepdot;
module.exports.factory = factory;

function update(obj, prop, value){
  
  if(_.isArray(value)){
    obj[prop] = value;
    return value;
  }
  
  var existing_prop = obj[prop];

  if(_.isObject(obj[prop]) && _.isObject(value)){
    extend(obj[prop], value);
  }
  else{
    
    obj[prop] = value;
    
  }

  return value;
}

function deepdot(obj, prop, value){

  if(obj===null){
    return null;
  }
  if(!prop){
    return obj;
  }
  prop = prop.replace(/^\./, '');
  var parts = prop.split('.');
  var last = parts.pop();
  var current = obj;
  var setmode = arguments.length>=3;

  if(!_.isObject(current)){
    return current;
  }

  while(parts.length>0 && current!==null){

    var nextpart = parts.shift();
    var nextvalue = current[nextpart]; 
    
    if(!nextvalue){

      if(setmode){
        nextvalue = current[nextpart] = {};
      }
      else{
        break;  
      }
      
    }
    else{
      if(!_.isObject(nextvalue)){
        break;
      }
    }

    current = nextvalue;
  }

  if(!_.isObject(current)){
    return current;
  }

  if(setmode){
    return update(current, last, value);
  }
  else{
    return current[last];
  }
}

/*

  return an event emitter that is hooked into a single object
  
*/
function factory(obj){
  
  function dot(){

    var args = _.toArray(arguments);
    args.unshift(obj);

    var ret = deepdot.apply(null, args);

    if(arguments.length>1){
      dot.emit('change', arguments[0], arguments[1]);
    }

    return ret;
  }

  _.extend(dot, EventEmitter.prototype);

  return dot;
}