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
    var reqs = (req.body || []).map(function(req){
      var headers = req.headers || {};
      if(headers['x-json-selector']){
        var selector = headers['x-json-selector'];
        return selector.string;
      }
      else{
        return null;
      }
    }).filter(function(req){
      return req!==null;
    })

    var parts = [
      new Date().getTime(),
      'contract',
      req.headers['x-contract-type'],
      (req.body || []).length,
      reqs.join(' ')
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

  function provision_logger(routes, resource){
    var parts = [
      new Date().getTime(),
      'provision',
      routes.supplier_route,
      JSON.stringify(resource)
    ]
    logger(parts);
  }

  function action_logger(type, req, resultcount){
    var data = '';

    if(type==='select'){
      data = (req.selector || {}).string;
    }
    else{
      data = (req.body || []).length;
    }

    var body = req.body || [];
    var tag = body.length>0 ? (body[0]._digger ? body[0]._digger.tag : '') : '';

    var parts = [
      new Date().getTime(),
      'action:' + type,
      req.headers['x-supplier-route'] + req.url,
      body.length + ' ' + tag + ' -> ' + data + ' -> ' + resultcount
    ]

    logger(parts);
  }

  function request_logger(req){
    if(req.headers['x-reception']){
      return;
    }
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