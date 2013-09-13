/*

  text
  
*/
module.exports = function(program){

  var Digger = require('./digger');
  var App = require('./app');

  var $digger = Digger(program);
  var config = $digger.stack_config;

  // website only
  if(Object.keys(config.warehouses||{})<=0){
    App($digger)
    return;
  }

  var Reception = require('./reception');
  var Warehouse = require('./warehouse');

  var reception = Reception($digger);
  var warehouses = Warehouse($digger);
  var app = App($digger);

  // pipe general requests to reception
  $digger.on('digger:request', function(req, res){
    process.nextTick(function(){
      reception(req, res);
    })
  });

  // requests going back to warehouses from reception
  reception.on('digger:warehouse', function(req, res){

    process.nextTick(function(){
      warehouses(req, function(error, results){        
        res(error, results)
      });
    })
  })

  // an event has happend in a warehouse - send to switchboard
  warehouses.on('digger:radio', function(type, packet){
    
  })


}