module.exports = function(program){
	var tools = require('./tools');
	var fs = require('fs');
  var path = require('path');

	var application_root = tools.application_root(program);
  var quarry_root = application_root + '/.quarry';
  var config_path = quarry_root + '/digger.json';
  var env_path = quarry_root + '/env';

  if(!fs.existsSync(config_path)){
    console.error('you need to run digger build first');
    process.exit(1);
  }

  var stack_config = require(config_path);

  // populate the env
  // this will come from outside now
  if(fs.existsSync(env_path)){

    var files = fs.readdirSync(env_path);

    (files || []).forEach(function(file){
      var envtext = fs.readFileSync(env_path + '/' + file, 'utf8');        
      process.env[file] = envtext;
    })
  }

  return {
    http_port:process.env.DIGGER_HTTP_PORT || 80,
    stack_config:stack_config,
    filepath:function(filepath){
      if(!filepath){
        return filepath;
      }
      if(filepath.charAt(0)==='/'){
        return path.normalize(filepath);
      }
      return path.normalize(application_root + '/' + filepath);
    }
  }

}