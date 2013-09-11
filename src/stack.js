module.exports = function(program){

	var Reception = require('./reception');
  var Apps = require('./apps');

  var utils = require('digger-utils');
	var Client = require('digger-client');
	var Build = require('./buildmodule');
	var Runtime = require('./runtime');
	var runtime = Runtime(program);
	var stack_config = runtime.stack_config;

	// our reception handler
	var reception = null;

	// make a digger that flags requests as internal
	// it then speaks to reception front door
	var $digger = Client(function(req, reply){
    req.internal = true;
    if(!reception){
    	reply('reception is not ready');
    	return;
    }
    reception(req, reply);
  });

	$digger.program = program;
	$digger.runtime = runtime;
	$digger.stack_config = stack_config;
  $digger.application_root = runtime.application_root;
  $digger.filepath = runtime.filepath;
  $digger.build = function(){
    var args = utils.toArray(arguments);
    args.unshift(this);
    return Build.apply(null, args);
  }

  reception = Reception($digger);

  apps = Apps($digger);

}
