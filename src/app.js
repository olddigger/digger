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
var fs = require('fs');

/*

  ----------------------------------------------------------------------------------  


  APP

  a front facing HTTP + socket server that writes over a /reception socket
  to speak to warehouses


  ----------------------------------------------------------------------------------
  
*/

module.exports = make_app;

function make_app(id, tools){

  var stack_config = tools.get_stack_config();
  var apps = stack_config.apps || {};

  // the array of apps we will run
  var app_array = [];

  function addapp(appid){
    if(!id || appid==id){
      var app = apps[appid];
      app.id = appid;
      app_array.push(app);  
    }
  }

  for(var appid in apps){
    addapp(appid);
  }

  /*
  
    if they name a specific app but get the name wrong
    
  */
  if(app_array.length<=0){
    console.error('there are no apps by that id: ' + id);
    process.exit();
  }

  /*
  
    this is the internal digger for server side scripts
    
  */

  var supplychain = tools.get_reception_supplychain();
  var $digger = tools.get_reception_digger(supplychain);
  
  /*
  
    this is the external digger for www and sockets
    
  */
  var Server = require('digger-serve');
  var www = Server();

  www.app.on('digger:request', function(req, reply){
    
    process.nextTick(function(){
      supplychain(req, function(error, answer){
        reply(error, answer);
      });  
    })
    
  })
  
  //  handler:get_reception_supplychain('external')
  

  var module_logs = [];

  console.log('');

/*
  app_array.forEach(function(app_config){

    var document_root = app_config.document_root ? 
      tools.filepath(app_config.document_root) :
      path.normalize(__dirname + '/../assets/www')

    var app = www.express();

    var domains = app_config.domains || [];
    
    var middleware = app_config.middleware;

    app.use(function(req, res, next){
      next();
    })
    app.use(www.express.static(document_root));

    www.add_website(domains, app);

    console.log('   mounting www: ' + app_config.id + ' -> ' + app_config.document_root);
  })
*/
  /*
  
    loop the app configs and create a virtual hosted express server
    
  */

  app_array.forEach(function(app_config){

    var app = www.express();

    var domains = app_config.domains || [];
    var middleware = app_config.middleware;

    if(typeof(domains)==='string'){
      domains = [domains];
    }

    var document_root = app_config.document_root ? 
      tools.filepath(app_config.document_root) :
      path.normalize(__dirname + '/../assets/www')

    function build_middleware(route, modulename, middleware_config){
      var handler = $digger.build(modulename, {
        config:middleware_config
      }, true);
      app.use(route, handler);
      if(modulename.match(/\.js/)){
        var parts = modulename.split('/');
        modulename = parts.pop();
      }
      module_logs.push('          module: ' + route + ' -> ' + modulename);
    }

    function makemiddleware(route){
      var middleware_settings = middleware[route];
      if(typeof(middleware_settings)==='string'){
        middleware_settings = {
          module:middleware_settings
        }
      }

      if(middleware_settings.module=='digger'){
        var handler = www.digger_application(middleware_settings);
        app.use(route, handler);
        module_logs.push('          module: ' + route + ' -> digger');
      }
      else{
        var middleware_config = middleware_settings.config || {};
        middleware_config.id = route;
        
        var module = middleware_settings.module;

        if(!module){
          console.error('the middleware must define a module');
          process.exit();
        }

        if(module.match(/[\/\.]/)){

          module = tools.filepath(module);
          
          if(module.match(/\.js$/)){
            build_middleware(route, module, middleware_config);
          }
          else{
            var files = fs.readdirSync($digger.filepath(module)) || [];

            files.forEach(function(file){
              var useroute = route + '/' + (file.replace(/\.js$/, ''));
              build_middleware(useroute, module + '/' + file, middleware_config);         
            })
          }
        }
        else{
          build_middleware(route, 'middleware/' + module, middleware_config);
        }
      }
    }
    
    for(var route in middleware){
      makemiddleware(route);
    }

    app.use(www.express.static(document_root));

    www.add_website(domains, app);

    console.log('   mounting www: ' + app_config.id + ' -> ' + app_config.document_root);

    domains.forEach(function(domain){
      console.log('     - ' + domain);
    })

    console.log(module_logs.join("\n"))

  })

  var port = tools.http_port();

  /*
  
    give the mesh a chance to setup
    
  */
  setTimeout(function(){
    www.server.listen(port, function(){
      console.log('');
      console.log('-------------------------------------------');
      console.log('HTTP listening on port: ' + port);
    })  
  }, 1000);
  
  
  return www;
}
