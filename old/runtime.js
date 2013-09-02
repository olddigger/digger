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

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var Telegraft = require('telegraft');


var Application = require('./application');
var Logger = require('./logger');
var Digger = require('./digger');



module.exports = function(application_root){



  var logger = Logger();
  var telegraft = Telegraft.client(hq_endpoints);
  var app = new Application(application_root);

  // a request that has come from the outside
  function external_mapper(req){

    /*
    
      make double sure there are no other properties creeping in
      
    */
    return {
      method:req.method,
      url:req.url,
      headers:req.headers,
      body:req.body
    }

  }

  // a request that has originated from server side code
  function internal_mapper(req, reply){
    /*
    
      this is a very important flag

      it means that because we are running code on the server we are effectively
      the root user and so can do what we want to our own stack

      req.internal cannot ever be set by the outside because only:

        method
        headers
        url
        body

      are copied from external requests
      
    */
    req.internal = true;
    return req;
  }

  /*
  
    return a $digger supplychain - internal means for scripts and such (i.e. trusted sources)
    external means from the dubdubs

    If I am sat here in 2 months still coding then somebody please fucking shoot me
    
  */
  function get_digger(internal){
    var request_mapper = internal ? internal_mapper : external_mapper;
    var reception_socket = telegraft.rpcclient('/reception');

    return Digger({
      hq_endpoints:hq_endpoints,
      logger:logger,
      application_root:application_root
    }, function(req, res){

      /*
      
        FRONT DOOR - this is the supply chain handler
        
      */
      var req = request_mapper(req);
      reception_socket.send(req, reply);
    })
  }



  function builder(app){

    /*
    
      the router
      
    */
    var reception = get_reception(app.inspect('/reception'));

    _.each(app.get_warehouses(), function(warehouse){

      console.log('mounting warehouse: ' + warehouse.id + ' -> ' + warehouse.module);
    })
  }



  function hq(){


  }

  function reception(){

    console.log(' booting reception');

    var proxy_socket = telegraft.rpcproxy();

    var config = app.inspect('/reception');

    if(config.router){
      console.log('   router: ' + config.router);
    }

    var $digger = get_digger(true);

    var reception = $digger.build('reception', config);

    reception.on('router:error', function(req, error){
      logger.error(req, error);
    })

    reception.on('digger:contract', function(req){
      logger.reception(req);
    })

    reception.on('digger:proxy', function(req, reply){
      //logger.error(req, error);
      console.log('-------------------------------------------');
      console.log('PROXY');
      console.dir(req);
      /*
      proxy.send(req.url, req, function(error, answer){
        process.nextTick(function(){
          reply(error, answer); 
        })
        
      });
      */
    })

  }

  function warehouse(){

  }

  function web(){

  }

  return {
    hq:hq,
    reception:reception,
    warehouse:warehouse,
    web:web
  };
}