// we put the requires inside of functions
// as a load on demand feature - we will use
// this to bootstrap various servers
// lets not bloat the memory with others the process does not need
module.exports = {
	stack:function(){
		return require('./stack');
	},
	reception:function(){
		return require('./reception');
	},
	app:function(){
		return require('./app');
	},
	warehouse:function(){
		return require('./warehouse');
	},
	core:function(){
		return require('./digger');
	}
}