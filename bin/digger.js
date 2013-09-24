#!/usr/bin/env node

/**
 * Module dependencies.
 */
var version = require(__dirname + '/../package.json').version;
var program = require('commander');
var Stack = require('digger-stack');

program
  .option('-d, --dir <string>', 'the folder the digger.yaml file lives in', '.')
  .option('-t, --transport <string>', 'the filename of the transport module to use', 'js')
  .option('-rh, --redishost <string>', 'the hostname for the redis service', '.')
  .option('-rp, --redisport <string>', 'the port for the redis service', '.')
  .option('-mh, --mongohost <string>', 'the hostname for the mongo service', '.')
  .option('-mp, --mongoport <string>', 'the port for the mongo service', '.')
  .version(version)

program
  .command('build')
  .description('build the app into a quarry stack')
  .action(function(){

    var builder = Stack.appbuilder();
    builder(program);

  })

program
  .command('run')
  .description('run the digger stack')
  .action(function(){

    var builder = Stack.appbuilder();
    builder(program);
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

    var diggerhelp = spawn('digger', ['--help']);

    diggerhelp.stdout.on('data', function (data) {
      console.log(data.toString());
    });

    diggerhelp.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    diggerhelp.on('close', function (code) {

    });
  });

if(process.argv.length<=2){
  process.argv.push(['--help']);
}

program.parse(process.argv);