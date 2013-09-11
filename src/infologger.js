module.exports = info_logger;

function info_logger(program){

  var Runtime = require('./runtime');
  var runtime = Runtime(program);
  var config = runtime.stack_config;

  var default_ports = {
    redis:6379,
    mongo:27017
  }

  console.log('');
  console.log('   * application root:         ' + config.application_root);      
  if(config.reception.router){
  console.log('   * reception router:         ' + config.reception.router);
  }
  
  console.log('   * services:');
  for(var service in config.services){
    console.log('     * ' + service);
    var prefix = 'DIGGER_' + service.toUpperCase();
    var host = process.env[prefix + '_HOST'];
    if(!host){
      host = '127.0.0.1';
    }
    var port = process.env[prefix + '_PORT'];
    if(!port){
      port = default_ports[service];
    }

    console.log('       host:                   ' + host);
    console.log('       port:                   ' + port);
  }
  console.log('   * warehouses:         ');
  function logwarehouse(name, warehouse){
    var wconfig = warehouse.config;
    console.log('     * ' + name);
    for(var k in wconfig){
      console.log('       ' + k + ': ' + wconfig[k]);
    }
  }
  function logapp(name, app){
    var aconfig = app;

    console.log('     * ' + name);
    console.log('     * ' + app.document_root);
    (aconfig.domains || []).forEach(function(d){
      console.log('         * ' + d);
    })
    
  }
  for(var warehouse in config.warehouses){
    logwarehouse(warehouse, config.warehouses[warehouse]);
  }
  console.log('   * apps:         ');
  for(var app in config.apps){
    logapp(app, config.apps[app]);
  }

}
