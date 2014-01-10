#!/usr/bin/env node

/**
 * Module dependencies.
 */
var version = require(__dirname + '/../package.json').version;
var program = require('commander');
var Stack = require('digger-stack');

program
  .option('-d, --dir <string>', 'the folder the digger.yaml file lives in', '.')
  .version(version)

program
  .command('build [trim]')
  .description('build the app into a quarry stack')
  .action(function(trim){

    if(trim){
      process.env.NODE_ENV=trim;
    }

    var builder = Stack.appbuilder();
    builder(program, function(){
      console.log('done');
    });

  })

program
  .command('run')
  .description('run the digger stack')
  .action(function(){

    var runner = Stack.runner();
    runner(program);
    
  })

program
  .command('info')
  .description('list info about the current stack')
  .action(function(){

    var info = Stack.appinfo();
    info(program);

  })

// run help if the command is not known or they just type 'digger'
program
  .command('*')
  .action(function(command){

    var spawn = require('child_process').spawn;

    spawn('digger', ['--help'], {
      stdio: 'inherit'
    });

  });

if(process.argv.length<=2){
  process.argv.push(['--help']);
}

program.parse(process.argv);