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
var fs = require('fs');
var path = require('path');
var wrench = require('wrench');

module.exports = function(program){
  /*

    return the endpoints for the HQ server
    
  */
  function hq_endpoints(){

    return {
      server:program.server ? program.server : 'tcp://' + (process.env.DIGGER_HQ_HOST || '127.0.0.1') + ':' + (process.env.DIGGER_HQ_SERVER_PORT || 8791),
      radio:program.radio ? program.radio : 'tcp://' + (process.env.DIGGER_HQ_HOST || '127.0.0.1') + ':' + (process.env.DIGGER_HQ_RADIO_PORT || 8792)
    }
  }

  /*

    return an endpoint for a single rpc node
    
  */
  function node_endpoint(type){

    type = type || 'warehouse';

    var defs = {
      warehouse:3891,
      reception:3892
    }

    if(program.node){
      return program.node;
    }
    var port = process.env.DIGGER_NODE_PORT || defs[type];
    process.env.DIGGER_NODE_PORT = port+1;
    return 'tcp://' + (process.env.DIGGER_HQ_HOST || '127.0.0.1') + ':' + port;
  }

  /*

    return an endpoint we can use for a server
    
  */
  function http_port(){
    if(program.http){
      return program.http;
    }
    return process.env.DIGGER_HTTP_PORT || 80;
  }

  /*

    the folder the application lives in - we need a digger.yaml in there
    
  */
  function application_root(){
    var app_root = program.dir;

    if(!app_root || app_root === '.'){
      app_root = process.cwd();
    }
    else if(app_root.indexOf('/')!=0){
      app_root = path.normalize(process.cwd() + '/' + app_root);
    }

    if(!fs.existsSync(app_root)){
      console.error(app_root + ' does not exist');
      process.exit();
    }

    return app_root;
  }

  function filepath(file){
    if(file.charAt(0)=='/'){
      return file;
    }
    return path.normalize(application_root() + '/' + file);
  }

  /*

    the folder we will write our runtime into
    
  */
  function build_root(){
    return application_root() + '/.quarry';
  }

  function ensure_compile_structure(){
    var config = get_stack_config();
    var utils = require('digger-utils');

    // the start of the environment
    var default_env = {
      DIGGER_STACK_ID:config.name + ':' + utils.littleid()
    }

    // the things we should only have to boot once
    if(!fs.existsSync(build_root() + '/services')){
      wrench.mkdirSyncRecursive(build_root() + '/services', 0777);
    }

    if(!fs.existsSync(build_root() + '/nodes')){
      wrench.mkdirSyncRecursive(build_root() + '/nodes', 0777);
    }

    // stack wide environment variables written one value per named file
    if(!fs.existsSync(build_root() + '/env')){
      wrench.mkdirSyncRecursive(build_root() + '/env', 0777);
    }

    for(var prop in default_env){
      if(!fs.existsSync(build_root() + '/env/' + prop)){
        fs.writeFileSync(build_root() + '/env/' + prop, default_env[prop], 'utf8');
        process.env[prop] = default_env[prop];
      }
    }

  }

  /*
  
    if there is already a folder for the service
    it means we are already running it

    we check that by looking at the services/<name>/PID file
    (which has the container id of the service)

    if it does not exist - we create a new service for them

    if it does - we check that service is running
    
  */
  function compile_services(services){
    for(var i in services){
      if(!fs.existsSync(build_root() + '/services/' + i)){
        fs.writeFileSync(build_root() + '/services/' + i, '', 'utf8');
      }
    }
  }

  function compile_warehouses(warehouses){
    for(var i in warehouses){
      var name = 'warehouse_' + i.replace(/^\//, '').replace(/\//g, '_').replace(/\W/g, '');
      var command = 'digger warehouse ' + i;
      fs.writeFileSync(build_root() + '/nodes/' + name, command, 'utf8');
    }

    var command = 'digger warehouses';
    fs.writeFileSync(build_root() + '/nodes/warehouses', command, 'utf8');
  }

  function compile_apps(apps){
    for(var i in apps){
      var name = 'app_' + i;
      var command = 'digger app ' + i;
      fs.writeFileSync(build_root() + '/nodes/' + name, command, 'utf8');
    }

    var command = 'digger apps';
    fs.writeFileSync(build_root() + '/nodes/apps', command, 'utf8');
  }


  function compile(){
    
    var config = get_stack_config();

    ensure_compile_structure();

    console.log('');
    console.log('   compiling: ' + process.env.DIGGER_STACK_ID);

    compile_services(config.services);
    compile_warehouses(config.warehouses);
    compile_apps(config.apps);

    var receptioncommand = 'digger reception';
    fs.writeFileSync(build_root() + '/nodes/reception', receptioncommand, 'utf8');

    var allcommand = 'digger run';
    fs.writeFileSync(build_root() + '/nodes/all', allcommand, 'utf8');
  }

  /*
  
    part of the .digger folder is an env folder with named files containing env vars
    to be used across the whole stack

    when we build a static service its details are written to the environment here
    
  */
  function env_path(){
    return build_root() + '/env';
  }

  function populate_env(done){
    
    if(fs.existsSync(env_path())){

      var files = fs.readdirSync(env_path());

      (files || []).forEach(function(file){
        var envtext = fs.readFileSync(env_path() + '/' + file, 'utf8');        
        process.env[file] = envtext;
      })

      done();
    }
    else{
      done();
    }
  }

  /*

    return the built json config for the application
    
  */
  function get_stack_config(){
    if(!fs.existsSync(build_root() + '/digger.json')){
      throw new Error('application must be built first');
    }
    return require(build_root() + '/digger.json');
  }


  /*

    this is triggered before running any nodes
    it converts the digger.yaml into json for easy injection into nodes

    it runs this in an external process to avoid bloating this processes memory space
    
  */
  function runbuild(done){


    if(program.built){
      populate_env(done);
      return;
    }
    var exec = require('child_process').exec;
    var endpoints = hq_endpoints();
    var command = 'digger build -d ' + application_root() + ' -s ' + endpoints.server + ' -r ' + endpoints.radio;
    exec(command, function(error, results){
      if(error){
        throw(error);
      }
      populate_env(done);
    });
  }

  /*

    the build step - we output any files we need for the digger stack to run

     * config -> convert the digger.yaml -> digger.json
    
  */
  function dobuild(){

    var Config = require('./config');

    console.log('running build');
    console.log(application_root());

    if(!fs.existsSync(build_root())){
      wrench.mkdirSyncRecursive(build_root(), 0777);

    }

    if(!fs.existsSync(build_root() + '/env')){
      wrench.mkdirSyncRecursive(build_root() + '/env', 0777);
    }

    var endpoints = hq_endpoints();
    var config = Config(application_root());

    config.hq_endpoints = endpoints;
    fs.writeFileSync(build_root() + '/digger.json', JSON.stringify(config, null, 4), 'utf8');
    
  }

  /*

    return a digger-client that is hooked up to the reception socket

    internal means from a server side script
    external means from an outside client
    
  */

  function get_reception_socket(){
    var telegraft = require('telegraft');
    var graft = telegraft.client(hq_endpoints());

    var socket = graft.rpcclient('/reception');

    return socket;
  }

  function get_reception_supplychain(){

    var socket = get_reception_socket();

    function supplychain(req, reply){
      socket.send(req, reply);
    }

    return supplychain;
  }



  /*

    a digger connected to the digger supplychains
    
  */

  function get_reception_digger(supplychain){
    if(!supplychain){
      supplychain = get_reception_supplychain();
    }
    
    var Client = require('digger-client');
    var utils = require('digger-utils');
    var Build = require('./build');

    var $digger = Client(function(req, reply){
      req.internal = true;
      supplychain(req, reply);
    });

    $digger.application_root = application_root();
    $digger.filepath = filepath;
    $digger.build = function(){
      var args = utils.toArray(arguments);
      args.unshift($digger);
      return Build.apply(null, args);
    }

    return $digger;
  }

  function info_logger(){

    var default_ports = {
      redis:6379,
      mongo:27017
    }

    var config = get_stack_config();

    console.log('');
    console.log('   * application root:         ' + config.application_root);      
    if(config.reception.router){
    console.log('   * reception router:         ' + config.reception.router);
    }
    console.log('   * hq:         ');
    console.log('       server:                 ' + config.hq_endpoints.server);
    console.log('       radio:                  ' + config.hq_endpoints.radio);
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


  return {
    compile:compile,
    info_logger:info_logger,
    hq_endpoints:hq_endpoints,
    node_endpoint:node_endpoint,
    http_port:http_port,
    application_root:application_root,
    filepath:filepath,
    build_root:build_root,
    get_stack_config:get_stack_config,
    runbuild:runbuild,
    dobuild:dobuild,
    get_reception_digger:get_reception_digger,
    get_reception_supplychain:get_reception_supplychain,
    get_reception_socket:get_reception_socket
  }
}
