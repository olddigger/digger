/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
var _ = require('lodash');

/**
 * Module dependencies.
 */

module.exports = function(options){
  options = options || {};

  function logger(parts){
    if(options.log===false){
      return;
    }
    console.log(parts.join("\t"));
  }

  function reception_logger(req){
    var parts = [
      new Date().getTime(),
      'contract',
      req.headers['x-contract-type'],
      (req.body || []).length
    ]
    logger(parts);
  }

  function error_logger(req, error){
    var parts = [
      new Date().getTime(),
      'error',
      req.url,
      error
    ]
    logger(parts);
  }

  function reception_logger(req){
    var parts = [
      new Date().getTime(),
      'contract',
      req.headers['x-contract-type'],
      (req.body || []).length
    ]
    logger(parts);
  }
  
  function provision_logger(routes, resource){
    var parts = [
      new Date().getTime(),
      'provision',
      routes.supplier_route,
      JSON.stringify(resource)
    ]
    logger(parts);
  }

  function action_logger(type, req){

    var data = '';

    if(type==='select'){
      data = (req.selector || {}).string;
      if(req.body.length>0){
        data += ' : context ' + req.body.length;
      }
    }
    else{
      data = (req.body || []).length;
    }

    var parts = [
      new Date().getTime(),
      'action:' + type,
      req.headers['x-supplier-route'] + req.url,
      data
    ]
    logger(parts);
  }

  function request_logger(req){
    var parts = [
      new Date().getTime(),
      'packet',
      req.method.toLowerCase(),
      req.url
    ]
    logger(parts);
  }

  return {
    array:logger,
    error:error_logger,
    reception:reception_logger,
    action:action_logger,
    request:request_logger,
    provision:provision_logger
  }
}