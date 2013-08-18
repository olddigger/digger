#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var version = require('../package.json').version;
var path = require('path');
var DiggerApp = require('digger-app');

var fs = require('fs');

program
  .option('-e, --env <string>', 'value for process.env.NODE_ENV', 'production')
  .version(version)

program
  .command('serve [app_root] [port]')
  .description('serve a digger application')
  .action(function(app_root, port){

    process.env.NODE_ENV = program.env;
    
  	if(!app_root){
  		app_root = process.cwd();
  	}
    else if(app_root.indexOf('/')!=0){
      app_root = path.normalize(process.cwd() + '/' + app_root);
    }

    if(!port){
      port = 80;
    }
    
    console.log('serving digger application: ' + app_root + '/digger.yaml');

    var app = DiggerApp({
    	application_root:app_root
    })

    app.on('loaded', function(doc){
    	console.log('warehouse routes:');
      for(var route in (doc.digger.suppliers || {})){
        var config = doc.digger.suppliers[route];
        console.log('   ' + route + ': ' + config.type);
      }
    })

    app.on('website', function(domain){
      console.log('website domain: ' + domain);
    })

    app.on('www', function(doc_root){
      console.log('webserver document_root: ' + doc_root);
    })

    app.start(port, function(){
      console.log('server listening on port: ' + port);
    });

  })

program.parse(process.argv);