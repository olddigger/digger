# Containers

The container API is the core of digger.  

It works a lot like JQuery - each container wraps an arbritrary length array of models (where JQuery wraps an array of DOM elements).

You can always read and write to the raw data - the container API gives you an easy way to do so.

It also hooks up with the [supplychain](https://github.com/binocarlos/digger-supplychain) to load models from the server.

## Creating containers
Create a new container with a specific tagname - the tagname is like the table name in a traditional database.

```js
// this line will be assumed through all the rest of the examples
var Container = require('digger-container');

var product = Container('product');
```

You can also pass an attributes object as the second argument:

```js
var product = Container('product', {
	name:'Blue Suede Shoes',
	price:78
})
```

If you have an array of JSON models already - you can just pass that:

```
var data = [{
	name:"Superman",
	rating:7.8
},{
	name:"Spiderman",
	rating:7.9
}]

var superheroes = Container(data);
```

## Changing attributes
Once you have a container - you can change the attributes of ALL models within it at once - just like JQuery:

```
// take our superheros container from above
var superheroes = Container(data);

// set the tagnames of every model to superhero
superheroes.tag('superhero')

// set a deep attribute for each superhero - this creates an object for 'filming'
superheroes.attr('filming.city', 'Los Angeles');
```

## Spawning new containers
We can also generate new containers from the data inside of existing ones:

```
// get a container with just superman inside
var superman = superheroes.eq(0);

superman.attr('loves', 'Louis Lane');
```

## Accessing models
You can get to the raw underlying model also:

```
// get the data inside the superman model
var raw_superman = superheroes.get(0);

console.dir(raw_superman)

/*

	{
		name:"Superman",
		rating:7.8,
		loves:"Louis Lane",
		_digger:{
			tag:'superhero'
		}
	}
	
*/
```

## Running Selectors

It is important in your mind to distinquish between **local** and **remote** selectors:

 * **local** - always run via the **find** method - searches the local _children models
 * **remote** - running the container as a function - loads remote data from the server

### Remote selectors

JQuery provides a top level function to select DOM elements from the page:

```js
$('div.myclass')
```

The above selects divs from anywhere on the page.

Digger containers do the same thing - running a container as a function means 'load anything below here from the database'.

```js
var warehouse = $digger.connect('/my/warehouse');

// load 'thing' models from the warehouse
warehouse('thing').ship(function(thing){

	// load 'subthing' models from the things returned above
	thing('subthing').ship(function(subthings){

	})
})
```

Note - the above could be written as:

```js
var warehouse = $digger.connect('/my/warehouse');

// load 'thing' models from the warehouse
warehouse('thing subthing').ship(function(subthings){

})
```

Which would be much more efficient because it means 1 round-trip not 2.

### Local Selectors

If you have loaded a tree of data (using the :tree modifier) - then it means your container has _children models.

We can use selectors on that local data using the **find** method.

```js
var warehouse = $digger.connect('/my/warehouse');

// load 'thing' models from the warehouse - load all children also
warehouse('thing:tree').ship(function(things){

	// search the local data not the database
	var local_results = things.find('subthing');
	console.log(local_results.count() + ' subthings loaded');

})
```

## Chainable Methods

Most container methods are chainable - an example:

```js
var container = $digger.create('thing');

container.attr('name', 'test').addClass('red').id('apples');
```

# API

## core

Core methods are called on the **$digger** object not on a container.

### create

Create a new container from the data provided.

If you supply just a string then the container will take on that tag.

```js
var product = $digger.create('product');

console.log(product.toJSON());

/*

	[{
		_digger:{
			diggerid:123,
			tag:'product'
		}
	}]
	
*/
```

A string and an object applies the object as attributes.
```js
var product = $digger.create('product', {
	price:10
});

console.log(product.toJSON());

/*

	[{
		price:10,
		_digger:{
			diggerid:123,
			tag:'product'
		}
	}]
	
*/
```

A single object or an array means raw models:

```js
var product = $digger.create([{
	price:10,
	_digger:{
		tag:'product'
	}
}])
```

### connect

Returns a warehouse that is bound to the given pathname.  This means contracts generated by this container will be routed to that backend warehouse.

Typically you use connect in the initialization of your app.

```js
var warehouse = $digger.connect('/my/custom/warehouse');

// warehouse is now a container with a supplychain
warehouse('product[price<100]').ship(function(products){

})
```

## instance methods

Each container instance has the following prototype:

### attr
Allows read/write access to the model using dot notation

```js
var container = $digger.create({
	address:{
		street:'Cornfield Road',
		town:'LittleSea',
		postcode:'LS4GH7'
	}
})

// read nested properties
var town = container.attr('address.town');

// write nested properties - new objects are created to hold them
container.attr('address.geo.long', 454584848);

// write complicated data
container.attr('address.geo.list', [{
	x:3433,
	y:4544
},{
	x:3457,
	y:4593
}])
```
### digger
Allows read/write access to the _digger model using dot notation

```js
var container = $digger.create();

// write a property into the _digger object
container.digger('meta', 56);

// read the diggerid
var id = container.digger('diggerid');
```

### data
Allows read/write access to the _digger model using dot notation

These values are not written to the database.

```js
var container = $digger.create();

// this is not saved to the server
container.data('temp', {
	num:48
})
```

### tag
Allows read/write access to the _digger.tag property

This will match the tag selector

```js
var container = $digger.create();

container.tag('product');

var tag = container.tag();
```

### id
Allows read/write access to the _digger.id property

This will match the '#' selector

```js
var container = $digger.create();

container.id('myid');

var id = container.id();
```

### classnames
Allows read/write access to the _digger.classnames property

Any classname will match the '.' selector

```js
var container = $digger.create();

container.classnames(['red', 'blue']);
var classnames = container.classnames();
```

### addClass(classname)
adds a classname to the models

```js
// multiple models
var container = $digger.create(...);

container.addClass('red');

// all models now have the 'red' class
```

### removeClass(classname)
removed a classname to the models

```js
// multiple models
var container = $digger.create(...);

container.removeClass('red');

// now no models have the 'red' class
```

### hasClass(classname)
tells you if the first model has the given class

```js
// multiple models
var container = $digger.create(...);

if(container.hasClass('red')){

}
```

### removeAttr / removeDigger / removeData
remove properties from models

```js
var container = $digger.create({
	color:'red'
});

container.digger('color', 'red');
container.data('color', 'red');

container.removeAttr('red');
container.removeDigger('red');
container.removeData('red');
```
### diggerwarehouse
Allows read/write access to the _digger.diggerwarehouse property

This defines what warehouse this model lives in

```js
var warehouse = $digger.connect('/my/warehouse');

warehouse('*:limit(1)').ship(function(thing){
	console.log(thing.diggerwarehouse());

	// this will log '/my/warehouse'
})
```

### is(tagname)
tells you if the first model is a tagname

```js
var container = $digger.create('product');

if(container.is('product')){
	// this will happen
}
```

### hasAttr(name)
tells you if the first model has the given attribute

```js
var container = $digger.create('product', {
	price:null
});

if(container.hasAttr('price')){
	// this will happen
}
```

### isEmpty
if models.length<=0

```js
var container = $digger.create([]);

if(container.isEmpty()){
	// this will happen
}
```

### inject_data(data)
extend the model with the given data

### diggerurl
return this.diggerwarehouse() + '/' + this.diggerid()

### title
the name or title property returned

### summary
a pretty string summarizing the model

### toJSON
returns an array of the containers underlying models

```js
var container = Container(data);

console.dir(container.toJSON())

```

### spawn
returns a new container based upon the provided models

```js
var container = Container(data);

var new_container = container.spawn([...]);

// new_container is hooked up to the same supplychain

```

### clone
returns a copy of the current container but with all of the diggerids changed

```js
var test = Container('product', {
  price:100,
  address:{
    postcode:'apples'
  }
})

var copy = test.clone();

copy.attr('price').should.equal(100);
copy.diggerid().should.not.equal(test.diggerid());
```
### containers
return an array of containers each one holding a single model in the current models array

```js
var data = [{
	name:"Superman",
	rating:7.8
},{
	name:"Spiderman",
	rating:7.9
}]

var superheroes = Container(data);

var containers = superheroes.containers();

// containers is now an array of 2 containers each with 1 model
```

### eq(index)
return a container for the model at the given index

```js
var superheroes = Container(data);

var spiderman = superheroes.eq(1);

// spiderman is a container
```

### get(index)
return the model at index

```js
var superheroes = Container(data);

var spiderman_data = superheroes.get(1);

// spiderman_data is a model
```

### add(container)
add some models to the current models array

```js
var superheroes = Container(data);
var silversurfer = Container({
	name:"Silver Surfer",
	rating:9.9
})

superheroes.add(silversurfer);

// count is now 3
console.log(superheroes.count());
```

### each(fn)
run a function over this.containers()

```js
var superheroes = Container(data);

superheroes.each(function(hero){
	console.log(hero.attr('name') + ': ' + hero.attr('rating'));
})
```

### map(fn)
map a function over this.containers()

```js
var superheroes = Container(data);

var ratings = superheroes.map(function(hero){
	return hero.attr('rating');
})
```

### count()
returns the length of the models array

```js
var superheroes = Container(data);

// = 2
var herocount = superheroes.count();
```

### first()
return a container for the first model

```js
var superheroes = Container(data);

var superman = superheroes.first();
```

### last
return a container for the last model

```js
var superheroes = Container(data);

var spiderman = superheroes.last();
```

### children
returns a container that is all of the container models children merged into one array

```js
var children_data = [{
	name:"Superman",
	rating:7.8,
	_children:[{
		name:"flying"
	},{
		name:"strength"
	}]
},{
	name:"Spiderman",
	rating:7.9,
	_children:[{
		name:"spinwebs"
	},{
		name:"spidersense"
	}]
}]

var superheroes = Container(children_data);
var abilities = superheroes.children();

// logs 4
console.log(abilities.count());
```

### recurse
run a function over a container for each model and all descendents

```js
var superheroes = Container(children_data);

superheroes.recurse(function(container){
	// superheroes and abilities
})
```

### descendents
return a container containing a flat model array of every model and it's descendents

```js
var superheroes = Container(children_data);

var allcontainers = superheroes.descendents();

// logs 6
console.log(allcontainers.count());
```

### skeleton
return an array of the _digger properties for each model

this is used by suppliers when resolving contracts

```js
var data = [{
	name:"Superman",
	rating:7.8
},{
	name:"Spiderman",
	rating:7.9
}]

var superheroes = Container(data);

superheroes.addClass('hero');

console.log(superheroes.skeleton());
```

logs:

```json
[{
	_digger:{
		diggerid:123,
		class:['hero']
	}
},
{
	_digger:{
		diggerid:456,
		class:['hero']
	}
}]
```