#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var version = require('../package.json').version;
var path = require('path');

var fs = require('fs');

program
  .option('-e, --env <string>', 'value for process.env.NODE_ENV', 'production')
  .version(version)

program
  .command('version')
  .description('display the current version number')
  .action(function(){
    console.log(version)
  })

/*

  this boots a digger stack in test mode
  this means it will not boot any database services
  instead assuming they are running locally

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

  also - it boots all warehouses and websites into this single process
  and does not detatch the process

  this makes

    digger test .

  a good command for booting a stack to see if it is behaving
  
*/
program
  .command('run [app_root] [port]')
  .description('run a digger application')
  .action(function(app_root, port){

  	if(!app_root){
  		app_root = process.cwd();
  	}
    else if(app_root.indexOf('/')!=0){
      app_root = path.normalize(process.cwd() + '/' + app_root);
    }

    if(!port){
      port = 80;
    }
    
    var Runner = require('../src/runner');
    var runner = new Runner('development');

    runner.on('error', function(error){
      console.error(error);
      process.exit();
    })
        
    runner.on('started', function(){
      console.log('application is running');
    })
    
    runner.boot(app_root);

    
    
  })

/*

  start an individually named service from the stack
  
*/
program
  .command('start [app_root] [service]')
  .description('run a digger application')
  .action(function(app_root, service){

    if(!service){
      service = app_root;
      app_root = null;
    }

    if(!app_root){
      app_root = process.cwd();
    }
    else if(app_root.indexOf('/')!=0){
      app_root = path.normalize(process.cwd() + '/' + app_root);
    }

    var Runner = require('../src/runner');
    var runner = new Runner('development');

    runner.on('error', function(error){
      console.error(error);
      process.exit();
    })

    runner.on('started', function(){
      console.log('service is running');
    })
    
    runner.start(app_root, service);

  })

program
  .command('*')
  .action(function(env){
    console.log('find out how to display help for a command that is not defined - commander.js help read needed');
  });

if(process.argv.length<=2){
  process.argv[2] = '--help';
}
program.parse(process.argv);