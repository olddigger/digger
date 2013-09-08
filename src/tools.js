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
    return application_root() + '/.digger';
  }

  /*
  
    the path to the env json containing our quarry environment services

    this does not list nodes (reception, app, warehouse) - they look after themselves

    this lists:

      * databases - mongo, redis,
      * filesystem - home, app, storage
      * keys - for api access
    
  */
  function env_path(){
    return application_root() + '/.digger';
  }

  function populate_env(done){
    if(fs.existsSync(build_root() + '/env.json')){
      var envtext = fs.readFileSync(build_root() + '/env.json', 'utf8');
      var digger_env = JSON.parse(envtext);

      for(var prop in digger_env){
        // we let existing env vars take priority
        // setting them here only lasts the process - hence having the file around
        // how the file is generated is external to here
        if(!process.env[prop]){
          process.env[prop] = digger_env[prop];
        }
      }

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


  return {
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
