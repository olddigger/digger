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


/*

  ----------------------------------------------------------------------------------  


  WAREHOUSE

  we make one warehouse node and can mount multiple suppliers onto it


  ----------------------------------------------------------------------------------
  
*/

module.exports = make_hq;

function make_hq(tools){
  var telegraft = require('telegraft');
  var endpoints = tools.hq_endpoints();
  var hq = telegraft.server(endpoints);
  console.log('   booting HQ');
  console.log('');
  console.log('       server: ' + endpoints.server);
  console.log('       radio: ' + endpoints.radio);
  console.log('');
  return hq;
}