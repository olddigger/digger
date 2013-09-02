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

var program = require('commander');
var version = require(__dirname + '/../package.json').version;
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Tools = require('../src/tools');

var tools = Tools(program);





/*

  ----------------------------------------------------------------------------------  


  HQ


  ----------------------------------------------------------------------------------
  
*/

function make_hq(){
  var HQ = require('../src/hq');

  return HQ(tools);
}




/*

  ----------------------------------------------------------------------------------  


  RECEPTION


  ----------------------------------------------------------------------------------
  
*/

function make_reception(){
  var Reception = require('../src/reception');

  return Reception(tools);
}

/*

  ----------------------------------------------------------------------------------  


  WAREHOUSE


  ----------------------------------------------------------------------------------
  
*/

function make_warehouse(id){

  var Warehouse = require('../src/warehouse');

  return Warehouse(id, tools);

}


/*

  ----------------------------------------------------------------------------------  


  WWW


  ----------------------------------------------------------------------------------
  
*/
function make_app(id){
  var App = require('../src/app');

  return App(id, tools);
}




/*

  CLI proper
  
*/
program
  .option('-b, --built', 'prevent the build from happening in a multi-node boot')
  .option('-d, --dir <string>', 'the folder the digger.yaml file lives in', '.')
  .option('-s, --server <string>', 'the endpoint for the HQ server')
  .option('-r, --radio <string>', 'the endpoint for the HQ radio')
  .version(version)

program
  .command('version')
  .description('display the current version number')
  .action(function(){
    console.log(version)
  })



program
  .command('build')
  .description('process the digger.yaml file')
  .action(function(){

    tools.dobuild();

  })


program
  .command('run')
  .description('run the digger app')
  .action(function(){

    console.log('');
    console.log('   digger stack v' + version);

    tools.runbuild(function(){
      
      make_hq();
      make_reception();
      make_warehouse();
      make_app();

    })
    

  })

program
  .command('hq')
  .description('run the digger hq node')
  .action(function(){

    console.log('');
    console.log('   digger hq v' + version);

    tools.runbuild(function(){
      make_hq();
    })
    

  })

program
  .command('reception')
  .description('run the digger reception node')
  .action(function(){

    console.log('');
    console.log('   digger reception v' + version);

    tools.runbuild(function(){
      make_reception();
    })
    

  })

program
  .command('app <app_id>')
  .description('run a digger app node')
  .action(function(app_id){

    console.log('');
    console.log('   digger app v' + version);

    tools.runbuild(function(){
      make_app(app_id);
    })
    

  })

program
  .command('apps')
  .description('run all digger app nodes')
  .action(function(){

    console.log('');
    console.log('   digger apps v' + version);

    tools.runbuild(function(){
      make_app();
    })
    

  })

program
  .command('warehouse <warehouse_id>')
  .description('run a digger warehouse node')
  .action(function(warehouse_id){

    console.log('');
    console.log('   digger warehouse v' + version);

    tools.runbuild(function(){
      make_warehouse(warehouse_id);
    })
    

  })

program
  .command('warehouses')
  .description('run all digger warehouse nodes')
  .action(function(){

    console.log('');
    console.log('   digger warehousess v' + version);

    tools.runbuild(function(){
      make_warehouse();
    })
    

  })

program
  .command('*')
  .action(function(command){
    
  });

program.parse(process.argv);