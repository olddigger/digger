#Components

When makeing a blueprint field - you give it a 'type' property.

The type can be one of the core digger field types - or - it can be a github repo.

If the type is a github repo - digger will download the repo, build it and inject it onto the page as the field.

##Component format

Digger components are built as [components](https://github.com/component/component).

This means you can include css, files and other components - read the [components](https://github.com/component/component) help page.

An example of the digger-url-component - a field that displays the digger url of the container.

The component.json:

```json
{
  "name": "digger-url-component",
  "repo": "binocarlos/digger-url-component",
  "description": "The first digger component to get the loader working (it displays the warehouse url of a container)",
  "version": "0.0.1",
  "keywords": [],
  "dependencies": {
    
  },
  "development": {},
  "license": "MIT",
  "main": "index.js",
  "styles": [
    "styles.css"
  ],
  "scripts": [
    "index.js",
    "template.js"
  ],
  "remotes": []
}
```
the component itself - notice how we include the template.

Also - we return a string as the export value.  The string is in angular markup and will be compiled as the field.


```js
// get a template we have done 'component convert' upon
var template = require('./template');

// register our component with digger
$digger.directive('urlComponent', function(){
	return {
    restrict:'EA',
    template:template,
    replace:true,
    controller:function($scope){

    	// directive logic goes here
			
    }
  }
})

// we return the angular markup used for the component
module.exports = '<url-component />';
```