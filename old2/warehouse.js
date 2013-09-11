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


  WAREHOUSE

  we make one warehouse node and can mount multiple suppliers onto it


  ----------------------------------------------------------------------------------
  
*/
module.exports = make_warehouse;

function make_warehouse(id, tools){
  
  var _ = require('lodash');

  var Logger = require('./logger');
  var logger = Logger();
  var utils = require('digger-utils');

  var telegraft = require('telegraft');
  var graft = telegraft.client(tools.hq_endpoints());

  var stack_config = tools.get_stack_config();
  var warehouses = stack_config.warehouses || {};
  var handlers = {};


  /*
  
    the ZMQ RPC Server socket
    
  */
  var endpoint = tools.node_endpoint('warehouse');
  var server_socket = graft.rpcserver({
    id:utils.littleid(),
    protocol:'rpc',
    address:endpoint
  })
  
  /*
  
    an array of the suppliers we are mounting
    
  */
  var warehouse_array = [];

  function addwarehouse(warehouseid){

    /*
    
      this is the warehouse filter for when we are mounting a single supplier
      
    */
    if(!id || warehouseid==id){
      var warehouse = warehouses[warehouseid];
      warehouse.id = warehouseid;
      warehouse_array.push(warehouse);  
    }
  }

  for(var warehouseid in warehouses){
    addwarehouse(warehouseid);
  }

  /*
  
    did we bum out on suppliers?
    
  */
  if(warehouse_array.length<=0){
    console.error('there are no warehouses by that id: ' + id);
    process.exit();
  }

  /*
  
    time for digger yo
    
  */
  var $digger = tools.get_reception_digger();

  console.log('');
  console.log('   mounting warehouse');
  console.log('');

  /*
  
    the module builder - $digger.build runs ./build
    
  */
  function build_warehouse(route, modulename, warehouse_config){
    var handler = $digger.build(modulename, warehouse_config, true);
    
    if(modulename.match(/\.js/)){
      var parts = modulename.split('/');
      modulename = parts.pop();
    }
    console.log('          module: ' + route + ' -> ' + modulename);

    if(typeof(handler.on)==='function'){
      handler.on('digger:action', logger.action);
    }

    return handler;
  }

  /*
  
    inject the route and replace the url

    this is so we can mount suppliers relatively

      /my/big/mashup/url/473636

    --->
      
      {
        headers:{
          'x-supplier-route':'/my/big/mashup/url'
        },
        url:'/473636'
      }
      
    
  */
  function build_warehouse_handler(warehouse, warehouse_handler){
    return function(req, res){

      req.headers['x-supplier-route'] = warehouse.id;
      req.url = req.url.substr(warehouse.id.length);

      warehouse_handler(req, res);
    }
  }

  // the actual build step
  function process_warehouse(warehouse){
    var module = warehouse.module;
    if(!module.match(/\./)){
      module = 'warehouses/' + module;
    }
    else{
      module = stack_config.application_root + '/' + module;
    }

    var warehouse_handler = build_warehouse(warehouse.id, module, warehouse);

    handlers[warehouse.id] = build_warehouse_handler(warehouse, warehouse_handler);

    server_socket.bind(warehouse.id);
  }

  // loop our warehouses and build them
  warehouse_array.forEach(process_warehouse);

  var routes = _.keys(handlers);

  routes.sort(function(a, b){
    return (b.split('/')).length - (a.split('/')).length; // ASC -> a - b; DESC -> b - a
  });
  
  /*
  
    the singular entry function for this warehouse

    the bug from hell made me kill the real warehouse but this works and I need a life - it understands
    
  */
  function warehouse_handler(req, res){
    var hit = false;
    var url = req.url;
    for(var i=0; i<routes.length; i++){
      var warehouse_route = routes[i];
      if(url.indexOf(warehouse_route)==0){
        hit = handlers[warehouse_route];
        break;
      }
    }
    if(hit){
      process.nextTick(function(){
        hit(req, function(error, answer){
          process.nextTick(function(){
            res(error, answer);
          })
        });
      })
    }
    else{
      res('404:warehouse route not found - ' + req.url)
    }
  };

  server_socket.on('request', function(req, reply){
    process.nextTick(function(){
      warehouse_handler(req, reply);  
    })   
  })

  return server_socket;
}