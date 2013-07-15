/*

  (The MIT License)

  Copyright (C) 2005-2013 Kai Davenport

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */


/*

	supply chain

  a container layer ontop of the underlying req, res network

  this connects a function with the container API

  so:

    var container = digger.supplychain(function(req, res){
      // here we have a req with

      // x-json-selectors filled in

    })

    container('find me').ship(function(stuff){
      // here we have whatever the function returned
    })


  it is a neat trick to create a supplychain that proxies over
  the network to fullfull the request

  This lets us make generic objects that access network services

  It also lets us use the same code to built a socket supply chain
  (for websocket browser connections) and a HTTP supply chain (for 
  REST api's etc)

	
*/
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var Container = require('./proto');
var Contract = require('../request/contract');
var Response = require('../request/response');

var Merge = Contract.mergefactory;
var Sequence = Contract.sequencefactory;

/*

  create a new supply chain that will pipe a req and res object into the
  provided fn

  
*/

function factory(){

  var url = '/';
  var supplierfn = null;
  var container = null;

  _.each(_.toArray(arguments), function(arg){
    if(_.isFunction(arg)){
      /*
      
        it is an existing container
        
      */
      if(_.isFunction(arg.diggerid)){
        container = arg;
      }
      /*
      
        otherwise the supplierchain function
        
      */
      else{
        supplierfn = arg;  
      }
    }
    /*
    
      it is a URL to create a container from
      
    */
    else if(_.isString(arg)){
      container = Container.factory('_supplychain');
      url = arg;
    }
    else if(_.isArray(arg) || _.isObject(arg)){
      if(!_.isArray(arg)){
        arg = [arg];
      }

      container = Container.factory(arg);
    }

  })


  if(!container){
    container = Container.factory('_supplychain');
  }

  if(!supplierfn){
    supplierfn = function(req, res){
      res.send404();
    }
  }

  if(!container.diggerwarehouse()){
    container.diggerwarehouse(url);
  }

  /*
  
    are we connected directly to some backend functions (i.e. non network mode)

    if yes then we will fake serialize the requests
    
  */
  var should_auto_serialize = supplierfn._diggertype=='warehouse' || supplierfn._diggertype=='supplier' || supplierfn._diggertype=='provider';

  function supplychain(){}

  _.extend(supplychain, EventEmitter.prototype);

  supplychain.ship = function(contract, callback){
    var self = this;

    var res = Response.factory(function(){

      /*
      
        resolve means extracting the multipart responses
        
      */
      res.resolve(function(results, errors){
        if(should_auto_serialize){
          results = JSON.parse(JSON.stringify(results));
        }
        var answer = results;
        if(contract.getHeader('x-expect')==='digger/containers'){
          if(results && results.length>0){
            answer = container.spawn(results);
          }
          else{
            answer = container.spawn();
          }
        }

        contract.emit('shipped', answer);
        callback(answer, res);
      })

    })

    if(should_auto_serialize){
      _.each(JSON.parse(JSON.stringify(contract.toJSON())), function(v, k){
        contract[k] = v;
      })
    }
    
    supplierfn(contract, res);

    return res;
  }

  /*
  
    the switchboard features of the supplychain
    
  */
  supplychain.listen = function(key, callback){
    if(supplierfn.switchboard){
      supplierfn.switchboard.listen(key, callback);
    }
    return this;
  }

  supplychain.broadcast = function(key, message){
    if(supplierfn.switchboard){
      supplierfn.switchboard.broadcast(key, message);
    }
    return this;
  }


  container.supplychain = supplychain;

  /*
  
    used to create other container with different URLs
    
  */
  container.connect = function(url){
    var ret = Container.factory('_supplychain');
    ret.diggerwarehouse(url);
    ret.supplychain = supplychain;
    return ret;
  }
  
  container.merge = function(arr){
    var contract = Merge(arr);
    contract.supplychain = supplychain;
    return contract;
  }

  container.sequence = function(arr){
    var contract = Sequence(arr);
    contract.supplychain = supplychain;
    return contract;
  }
  

  return container;
}

module.exports = factory;