#!/usr/bin/env node


/*

    var env = {

      DIGGER_MONGO_HOST:'127.0.0.1',
      DIGGER_MONGO_PORT:27017,
      DIGGER_MONGO_LOGIN:'root',
      DIGGER_MONGO_PASSWORD:'root',
      DIGGER_MONGO_url:'mongodb://root:root@127.0.0.1:27017'

      DIGGER_REDIS_HOST:'127.0.0.1',
      DIGGER_REDIS_PORT:6379,
      DIGGER_REDIS_PASSWORD:'apples',

      DIGGER_HQ_HOST:'127.0.0.1',
      DIGGER_HQ_SERVER_PORT:8791,
      DIGGER_HQ_RADIO_PORT:8792,

      // the IP of the host the container is running on
      DIGGER_NODE_HOST:'127.0.0.1',
      // the port opened by docker into the container
      // we use these to tell the hq where we are
      DIGGER_NODE_PORT:3434
      
    }

 
  
*/

/**
 * Module dependencies.
 */
var path = require('path');

/*

  ----------------------------------------------------------------------------------  


  APP

  a front facing HTTP + socket server that writes over a /reception socket
  to speak to warehouses


  ----------------------------------------------------------------------------------
  
*/

module.exports = make_reception;

function make_reception(tools){

  var Logger = require('../src/logger');
  var logger = Logger();
  var utils = require('digger-utils');

  var telegraft = require('telegraft');
  var graft = telegraft.client(tools.hq_endpoints());

  var Reception = require('digger-reception');
  var reception = Reception();

  var stack_config = tools.get_stack_config();
  var config = stack_config.reception;

  // the proxy onto the backend warehouses
  var proxy_socket = graft.rpcproxy();

  // the server socket for things coming from the web
  var endpoint = tools.node_endpoint('reception');
  var server_socket = graft.rpcserver({
    id:utils.littleid(),
    protocol:'rpc',
    address:endpoint
  })


  reception.on('digger:contract', function(req){
    logger.reception(req);
  })

  reception.on('digger:request', function(req, reply){
    run_request(req, reply);
  });

  server_socket.on('request', function(req, reply){

    console.log('-------------------------------------------');
    console.log('reception');
    console.dir(req);
    reception(req, function(error, answer){

      process.nextTick(function(){
        reply(error, answer);
      })
      
    });
  });

  server_socket.bind('/reception');
  

  function warehouse_proxy(req, reply){
    logger.request(req);

    proxy_socket.send(req.url, req, reply);
  }

  var router = null;

  if(config.router){
    var $digger = tools.get_reception_digger();

    if(typeof(config.router)==='string'){
      config.router = {
        module:config.router,
        config:{}
      }
    }

    console.log('');
    console.log('   mounting reception: ' + endpoint);
    console.log('   mounting reception router: ' + config.router.module);
    console.log('');

    router = $digger.build($digger.filepath(config.router.module), config.router.config, true);
  }

  function run_request(req, reply){
    if(router){
      router(req, function(error, answer){
        if(error){
          logger.error(error);  
        }
        reply(error, answer);
      }, function(){
        process.nextTick(function(){
          warehouse_proxy(req, reply);  
        })
      })
    }
    else{
      process.nextTick(function(){
        warehouse_proxy(req, reply);
      })
    }
  }



  return reception;
}