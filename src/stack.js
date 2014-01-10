/*
  Module dependencies.
*/

var SupplyChain = require('digger-supplychain');
var Bridge = require('digger-bridge');
var Stack = require('digger-stack');
var Security = require('digger-security-guard');
var Mongo = require('digger-mongo');
var Static = require('digger-static');
var Mailgun = require('digger-mailgun');
var engine = require('ejs-locals');
var DiggerServe = require('digger-serve');

var catchallrouter = require('./catchallrouter');
var scriptloader = require('./scriptloader');

module.exports = function(server){

	

var App = require('./app');

var server = new DiggerServe();

var app = App(server);

var port = process.env['DIGGER_PORT'] || 80;

server.listen(port, function(){
	console.log('server listening: ' + port);
})

	var app = server.website({
		document_root:__dirname + '/www',
		parser:true,
		session:true,
		domains:[
			"app.buildrightuk.com",
	    "app.buildright.digger.io",
	    "app.buildright.local.digger.io",
	    "localhost",
	    "192.168.1.182"
		]
	})

	app.set('views', __dirname + '/www');
  app.engine('html', engine);
  app.set('view engine', 'html');

	// the suppliers
	var suppliers = {
		'/config':Static({
			folder:__dirname + '/xml/config'
		}),
		'/users/admin':Static({
			file:__dirname + '/xml/admin/users.xml'
		}),
		'/email':Mailgun({
			apikey:process.env.DIGGER_MAILGUN_APIKEY,
			apikey:process.env.DIGGER_MAILGUN_DOMAIN
		}),
		'/users/buildright':Mongo({
			database:'buildright_system',
			collection:'users'
		}),
		'/users/clients':Mongo({
			database:'buildright_system',
			collection:'clients'
		}),
		'/project':Mongo({
			database:'buildright_projects',
			provision:'collection'
		})
	}

	// server supply-chain
	var $digger = new SupplyChain();

	// reception stack
	var stack = new Stack({
		router:require('./lib/router')($digger),
		suppliers:suppliers
	});

	$digger.on('request', function(req, reply){
		req.internal = true;
		stack.reception(req, reply);
	})

	// warehouses

	// catchall -> index.html
	app.use(catchallrouter());

	// digger REST api
	var http_handler = Bridge(function(req, reply){
		stack.reception(req, reply);
	})
	
	app.use('/api/v1', http_handler);

	// scripts
	var scripts = scriptloader($digger);
	app.use('/scripts', function(req, res, next){
		var handler = scripts[req.url.replace(/^\//, '')];
		if(handler){
			handler(req, res, next);
		}
		else{
			res.statusCode = 404;
			res.send('not found: ' + req.url);
		}
	})

	// security
	var clientauth = Security({
		id: "/clientauth",
		warehouse: "/users/clients",
		paths:{
			post_login:"/"
		}
	}, $digger)

	var builderauth = Security({
		id: "/builderauth",
		warehouse: "/users/buildright",
		paths:{
			post_login:"/",
			post_register: "/scripts/post_register"
		}
	}, $digger)

	app.use(clientauth);
	app.use(builderauth);

	app.get('/index.html', function(req, res){
		var session = req.session;
		var user = null;
		if(session.auth){
			user = session.auth.user;
			var pubuser = {};
			Object.keys(user || {}).forEach(function(key){
				if(key.indexOf('_password')!=0){
					pubuser[key] = user[key];
				}
			})
			user = pubuser;
		}
		res.render('index', {
			user:JSON.stringify(user, null, 4)
		})
	})

	return app;
}