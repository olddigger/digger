
function build_middleware($digger, modulename, middleware_config){
 /*
        
  	build the middleware
  	
  */
  return $digger.build(modulename, {
    config:middleware_config
  }, true);
}



function makemiddleware($digger, route, middleware_settings){

  if(typeof(middleware_settings)==='string'){
    middleware_settings = {
      module:middleware_settings
    }
  }

  var middleware_config = middleware_settings.config || {};
  middleware_config.id = route;
  
  var module = middleware_settings.module;

  if(!module){
    console.error('the middleware must define a module');
    process.exit();
  }

  var fs = require('fs');

  if(module.match(/[\/\.]/)){

    module = $digger.filepath(module);
    
    if(module.match(/\.js$/)){
      return build_middleware($digger, module, middleware_config);
    }
    else{
      var files = fs.readdirSync($digger.filepath(module)) || [];

      return files.map(function(file){
        var useroute = route + '/' + (file.replace(/\.js$/, ''));

        return {
          route:useroute,
          fn:build_middleware($digger, module + '/' + file, middleware_config)
        }
      })
    }
  }
  else{
    return build_middleware($digger, 'middleware/' + module, middleware_config);
  }
}

function get_middleware_array($digger, middleware){
  var utils = require('digger-utils');
  var stack = [];
  for(var route in middleware){
    var fn = makemiddleware($digger, route, middleware[route]);
    if(utils.isArray(fn)){
      stack = stack.concat(fn);
    }
    else{
      stack.push({
        route:route,
        fn:fn
      })
    }
    
  }
  return stack;
}

module.exports = function($digger, id){

  var Serve = require('digger-serve');
  var utils = require('digger-utils');

  var diggerserver = Serve();	
  var diggerapp = diggerserver.app;

  $digger.digger_middleware = function(){
    return diggerserver.digger_middleware.apply(diggerserver, utils.toArray(arguments));
  }

	/*
	
		sort out what apps to boot
		
	*/

	var appconfigs = $digger.stack_config.apps || {};

  // the array of apps we will run
  var app_array = [];

  for(var appid in appconfigs){
    var useapp = false;

    if(!id || appid==id){
      useapp = true;
    }
    if(useapp){
      var appconfig = appconfigs[appid];
      appconfig.id = appid;
      app_array.push(appconfig);    
    }
  }

  /*
  
    if they name a specific app but get the name wrong
    
  */
  if(app_array.length<=0){
    console.error('there are no apps by that id: ' + id);
    process.exit();
  }

	/*
	
		mount the websites
		
	*/
	app_array.forEach(function(app_config){

    var domains = app_config.domains || [];
    var middleware = get_middleware_array($digger, app_config.middleware);

    if(typeof(domains)==='string'){
      domains = [domains];
    }

    var document_root = app_config.document_root ? 
      $digger.filepath(app_config.document_root) :
      $digger.filepath(__dirname + '/../assets/www')

    diggerserver.digger_application(domains, document_root, middleware);
	})

	diggerserver.listen($digger.runtime.http_port, function(){
		console.log('server listening: ' + $digger.runtime.http_port);
	})

  // proxy the web server digger requests onto the overal reception pipeline
  diggerserver.on('digger:request', function(req, reply){
    $digger.emit('digger:request', req, reply);
  })

  return diggerserver;

}
