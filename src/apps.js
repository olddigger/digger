
function build_middleware($digger, app, route, modulename, middleware_config){
 /*
        
  	build the middleware
  	
  */
  var handler = $digger.build(modulename, {
    config:middleware_config
  }, true);
  app.use(route, handler);
}

function makemiddleware($digger, app, route, middleware_settings){

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
      build_middleware($digger, app, route, module, middleware_config);
    }
    else{
      var files = fs.readdirSync($digger.filepath(module)) || [];

      files.forEach(function(file){
        var useroute = route + '/' + (file.replace(/\.js$/, ''));

        build_middleware($digger, app, useroute, module + '/' + file, middleware_config);         
      })
    }
  }
  else{
    build_middleware($digger, app, route, 'middleware/' + module, middleware_config);
  }
}

module.exports = function($digger){

  var Serve = require('digger-serve');
  var Fileserver = require('node-static');

  var diggerserver = Serve();	
  var diggerapp = diggerserver.app;

  $digger.digger_application = diggerserver.digger_application;

	/*
	
		sort out what apps to boot
		
	*/

	var appconfigs = $digger.stack_config.apps || {};

  // the array of apps we will run
  var app_array = [];

  for(var appid in appconfigs){
    var appconfig = appconfigs[appid];
    appconfig.id = appid;
    app_array.push(appconfig);  
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

		var wwwapp = diggerserver.express();

    var domains = app_config.domains || [];
    var middleware = app_config.middleware;

    if(typeof(domains)==='string'){
      domains = [domains];
    }

    var document_root = app_config.document_root ? 
      $digger.filepath(app_config.document_root) :
      $digger.filepath(__dirname + '/../assets/www')

    var fileserver = new Fileserver.Server(document_root);

    for(var route in middleware){
      makemiddleware($digger, wwwapp, route, middleware[route]);
    }

		wwwapp.use(function(req, res){
			var url = req.url;
			if(url==='/'){
				url = '/index.html';
			}
			fileserver.serve(req, res);
		})

    diggerserver.add_website(domains, wwwapp);
	})

	diggerserver.server.listen($digger.runtime.http_port, function(){
		console.log('server listening: ' + $digger.runtime.http_port);
	})

}
