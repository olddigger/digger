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


module.exports = make_reception;

function make_reception($digger){

  var logger = require('./logger');
  var utils = require('digger-utils');

  var Reception = require('digger-reception');
  var reception = Reception();

  var stack_config = $digger.stack_config;
  var config = stack_config.reception;

  var router = null;

  // if they have specified a router - build it
  if(config.router){
    
    if(typeof(config.router)==='string'){
      config.router = {
        module:config.router,
        config:{}
      }
    }

    console.log('');
    console.log('   mounting reception router: ' + config.router.module);
    console.log('');

    router = $digger.build($digger.filepath(config.router.module), config.router.config, true);
  }

  // we emit the request and let the containing network sort it out
  function warehouse_proxy(req, reply){
    //logger.request(req);

    reception.emit('digger:warehouse', req, reply);
  }

  // this runs via the router if defined
  // otherwises back to the warehouses
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

    // log error
  reception.on('digger:contract:error', function(req, error){
    logger.reception_error(req, error);
  })

  // log symlinks
  reception.on('digger:symlink', function(link){
    logger.symlink(link);
  })

  // log results
  reception.on('digger:contract:results', function(req, count){
    logger.reception_results(req, count);
  })

  // run a request back to warehouses
  reception.on('digger:request', function(req, reply){
    if(!req.fromcontract){
      logger.request(req);
    }
    run_request(req, reply);
  })


  return reception;
}