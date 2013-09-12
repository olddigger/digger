module.exports.application_root = application_root;

/*

  the folder the application lives in - we need a digger.yaml in there
  
*/
function application_root(program){

  if(!program){
    return process.cwd();
  }
  
  var fs = require('fs');

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