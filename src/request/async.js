/*

  (The MIT License)

  Copyright (C) 2005-2013 Kai Davenport

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
 
/*

	digger.io main API
	
*/


/*

  prepare the env
  
*/
var async = require('async');
var _ = require('lodash');

var exports = module.exports = {

  batch:function(arr, alldone){
    var newarr = _.isArray(arr) ? [] : {};

    _.each(arr, function(val, key){
      var fn = function(done){
        if(_.isFunction(val.getHeader) && val.getHeader('x-contract-type')){
          val.ship(function(results){
            lastresults = results;
            done(null, results);
          })
        }
        else{
          val(done);
        }
      }

      if(_.isArray(newarr)){
        newarr.push(fn);
      }
      else{
        newarr[key] = fn;
      }
    })

    async.parallel(newarr, alldone);
  },

  pipe:function(arr, alldone){
    var lastresults = null;

    async.forEachSeries(arr, function(fn, nextfn){
      if(_.isFunction(fn.getHeader) && fn.getHeader('x-contract-type')){
        fn.ship(function(results){
          lastresults = results;
          nextfn(null, results);
        })
      }
      else{
        fn(lastresults, function(error, results){
          lastresults = results;
          nextfn();
        })
      }
    }, function(error){
      if(alldone){
        alldone(null, lastresults);
      }
    })
  },

  merge:function(arr, alldone){

    var newfns = _.isArray(arr) ? [] : {};

    _.each(arr, function(fn, key){
      var newfn = function(nextfn){
        if(_.isFunction(fn.getHeader) && fn.getHeader('x-contract-type')){
          fn.ship(function(results){
            nextfn(null, results);
          })
        }
        else{
          fn(function(error, results){
            nextfn(null, results);
          })
        }
      }

      if(_.isArray(arr)){
        newfns.push(newfn);
      }
      else{
        newfns[key] = newfn;
      }
    })

    async.parallel(newfns, function(error, results){
      if(alldone){
        alldone(null, results);
      }
    })
  }

}