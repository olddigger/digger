#Data Structure

Digger works with **arrays of objects** as it's primary data structure.

In digger a 'model' is the raw data structure not an ORM object or other such 'object'.

We 'wrap' the models in code that loops over them and changes values in them.

If we extract the raw models from a container - we can easily create another container and they are effectively the same thing.

```js
var data = [{
	name:'thing'
}]

var container1 = $digger.create(data);

container1.attr('color', 'red');

var container2 = $digger.create(container1.toJSON());

// container 2 is exactly the same as container1 - they both point to the same data.

```

## models
A model is a pure JavaScript object.

Take a model with 2 attributes - **color** and **size**.

An array with 2 models would be:

```json
[{
	"color":"red",
	"size":"big"
},{
	"color":"blue",
	"size":"small"
}]
```

## digger meta data
We need some extra 'meta' data to be saved with each model on the database - so, we introduce a '_digger' object to each model.

```json
[{
	"color":"red",
	"size":"big",
	"_digger":{
		"diggerid":1,
		"tag":"cushion"
	}
},{
	color:'blue',
	size:'small',
	"_digger":{
		"diggerid":2,
		"tag":"cushion"
	}
}]
```

## _digger properties
The properties we save in the _digger objects vary from supplier to supplier but the core ones are:

 * diggerid - the global id for the model
 * diggerwarehouse - the path of the warehouse the model came from
 * tag - the tag of the model (i.e. the 'type' it is)
 * class - an array of classnames this model belongs to
 * id - an id applied to the model for # based selectors
 * diggerparentid - the id of the parent model
 * diggerpath - an array of ids denoting the path to the model

## _data
Because digger 'wraps' the data and holds no state in the code itself - we loose the ability to stash values that are not saved to the database.

For this reason the **_data** property of each model is a reserved word that is never saved to the database.

This lets us keep state in the digger client to do with our localised app but not have to concern the database with this data.

```js
var container = $digger.create(...);

container.data('stash', {...});

container.save().ship(function(){
	// the 'stash' property is not saved to the db
})
```

An example of a container with some _data:

```json
[{
	"name":"thing",
	"_data":{
		"stash":{}
	}
}]
```

## _children
digger is a document database with a tree structure.  Using the :tree modifier you can load a whole sub-set of the database in one query.

This results in local data having **children**.

The _children property is reserved for this purpose - local children models.

The _children property is an array of child models - here is some data:

```json
[{
	"name":"parent",
	"_children":[{
		"name":"child1"
	},{
		"name":"child2"
	}]
}]
```

## attributes
As well as the various meta data - the top level object also contains the attributes of the model.

The attributes can be deep nested and container any valid JSON data structure.

Here is an example of a model with an address property that itself is an object:

```json
[{
	"address":{
		"street":"Cornfield Road",
		"town":"Littlesea",
		"postcode":"LS45GH"
	}
}]
```
The container wrapper lets us access these values easily:

```js
var container = $digger.create(model);

console.log(container.attr('address.postcode') + ' is the postcode');
```