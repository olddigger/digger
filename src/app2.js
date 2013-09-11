module.exports = function(program, appname){

	var Runtime = require('./runtime');
	var express = require('express');
	var lactate = require('lactate');
	
	var http = require('http');
	var vhost = require('express-vhost');

	var runtime = Runtime(program);
	var stack_config = runtime.stack_config;

	var diggerapp = express();
	var httpserver = http.createServer(diggerapp);

	/*
	
		sort out what apps to boot
		
	*/

	var appconfigs = stack_config.apps || {};

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

	diggerapp.configure(function(){
	
		diggerapp.use(express.query());
		diggerapp.use(express.bodyParser());
		//app.use(cookieParser);
		//app.use(express.session({store: redisStore}));
	
	});

	/*
	
		mount the websites
		
	*/
	app_array.forEach(function(app_config){

		var wwwapp = express();

    var domains = app_config.domains || [];
    var middleware = app_config.middleware;

    if(typeof(domains)==='string'){
      domains = [domains];
    }

    var document_root = app_config.document_root ? 
      runtime.filepath(app_config.document_root) :
      runtime.filepath(__dirname + '/../assets/www')

 		var files = lactate.dir('files', {
 			root:document_root
 		});

		wwwapp.use(files.toMiddleware());

		domains.forEach(function(domain){
			vhost.register(domain, wwwapp);
		})
	})

	diggerapp.use(vhost.vhost());

	httpserver.listen(runtime.http_port, function(){
		console.log('server listening: ' + runtime.http_port);
	})

}
