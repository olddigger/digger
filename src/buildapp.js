module.exports = function(program){
	var fs = require('fs');
	var path = require('path');
	var tools = require('./tools');
	var Config = require('./config');
	var wrench = require('wrench');
	var utils = require('digger-utils');

	var application_root = tools.application_root();
	var stack_config = Config(application_root);

	var build_root = application_root + '/.quarry';

	wrench.mkdirSyncRecursive(build_root, 0777);

  // the start of the environment
  var default_env = {
    DIGGER_STACK_ID:stack_config.name + ':' + utils.littleid()
  }

  // the things we should only have to boot once
  if(!fs.existsSync(build_root + '/services')){
    wrench.mkdirSyncRecursive(build_root + '/services', 0777);
  }

  // stack wide environment variables written one value per named file
  if(!fs.existsSync(build_root + '/env')){
    wrench.mkdirSyncRecursive(build_root + '/env', 0777);
  }

  for(var prop in default_env){
    if(!fs.existsSync(build_root + '/env/' + prop)){
      fs.writeFileSync(build_root + '/env/' + prop, default_env[prop], 'utf8');
      process.env[prop] = default_env[prop];
    }
  }

  for(var servicename in (stack_config.services|| {})){
    if(!fs.existsSync(build_root + '/services/' + servicename)){
      fs.writeFileSync(build_root + '/services/' + servicename, '', 'utf8');
    }
  }

  var allroutes = [];
  for(var warehousename in (stack_config.warehouses || {})){
    var app = stack_config.warehouses[warehousename];

    allroutes.push(warehousename);
  }

  var alldomains = [];
  for(var i in (stack_config.apps || {})){
    var app = stack_config.apps[i];

    (app.domains || []).forEach(function(domain){
      alldomains.push(domain);
    })
  }

  fs.writeFileSync(build_root + '/domains', alldomains.join("\n"), 'utf8');

  var command = 'digger apps';

  if(allroutes.length>0){
    command = 'digger run';
  }

  fs.writeFileSync(build_root + '/bootstrap', command, 'utf8');
  fs.writeFileSync(build_root + '/digger.json', JSON.stringify(stack_config, null, 4), 'utf8');
  console.log('built: ' + application_root + '/.quarry');
	

}