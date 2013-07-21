/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

/*
  Module dependencies.
*/

var _ = require('lodash');
var xml = require('xmldom');

module.exports.parse = fromXML;
module.exports.stringify = toXML;

/*
  digger.io - XML Format
  ----------------------

  Turns XML strings into container data and back again


 */
function null_filter(val){
  return !_.isUndefined(val) && !_.isNull(val);
}

function data_factory(element){

  if(element.nodeType!=element.ELEMENT_NODE){
    return;
  }

  var metafields = {
    id:true,
    diggerid:true
  }
  
  var manualfields = {
    tag:true,
    class:true
  }

  var data = {
    _digger:{
      tag:element.nodeName,
      class:_.filter((element.getAttribute('class') || '').split(/\s+/), function(classname){
        return classname.match(/\w/);
      })
    },
    _children:[]
  }
  
  _.each(metafields, function(v, metafield){
    data._digger[metafield] = element.getAttribute(metafield) || '';
  })

  _.each(element.attributes, function(attr){
    if(!metafields[attr.name] && !manualfields[attr.name]){
      data[attr.name] = attr.value;
    }
  })

  data._children = _.filter(_.map(element.childNodes, data_factory), null_filter);

  return data;
}

/*

  includes xmldom
  
*/
function XMLParser(st){

  /*
  
    server side XML parsing
    
  */
  
  var DOMParser = xml.DOMParser;
  var doc = new DOMParser().parseFromString(st);
  var results = _.map(doc.childNodes, data_factory);
  
  return results;
}

function fromXML(string){

  return XMLParser(string);

}


function string_factory(data, depth){

  var meta = data._digger || {};
  var children = data._children || [];
  var attr = data;

  function get_indent_string(){
    var st = "\t";
    var ret = '';
    for(var i=0; i<depth; i++){
      ret += st;
    }
    return ret;
  }

  var pairs = {
    id:meta.id,
    class:_.isArray(meta.class) ? meta.class.join(' ') : ''
  }

  var pair_strings = [];

  _.each(attr, function(val, key){
    if(key.indexOf('_')===0){
      return;
    }
    pairs[key] = _.isString(val) ? val : '' + val;
  })

  _.each(pairs, function(value, field){
    if(!_.isEmpty(value)){
      pair_strings.push(field + '="' + value + '"');  
    }
  })

  if(children && children.length>0){
    var ret = get_indent_string() + '<' + meta.tag + ' ' + pair_strings.join(' ') + '>' + "\n";

    _.each(children, function(child){      
      ret += string_factory(child, depth+1);
    })

    ret += get_indent_string() + '</' + meta.tag + '>' + "\n";

    return ret;    
  }
  else{
    return get_indent_string() + '<' + meta.tag + ' ' + pair_strings.join(' ') + ' />' + "\n";
  }
}

/*
  This is the sync version of a warehouse search used by in-memory container 'find' commands

  The packet will be either a straight select or a contract
 */
function toXML(data_array){
  return _.map(data_array, function(data){
    return string_factory(data, 0);
  }).join("\n");
}