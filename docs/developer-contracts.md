#Contracts

Contracts allow you to read and write data back to warehouses.

There are 4 types of contract:

 * select - read data
 * append - add new data
 * save - save exiting data
 * remove - delete data

You generate a contract by calling one of the above methods on a container that has a supplychain.

You run the contract by calling it's 'ship' method which in turn sends the contract to the digger reception to be resolved.

## select example

```js

// generate the contract by running select on a container
// (this is done by invoking the container as a function)

var container = $digger.connect('/my/warehouse');
var contract = container('product');

// send the contract to the server
contract.ship(function(results){

})
```

## append example

```js

// generate the contract by running select on a container
// (this is done by invoking the container as a function)

var container = $digger.connect('/my/warehouse');

var new_container = $digger.create('product', {
	name:'apples',
	price:10
})

var contract = container.append(new_container);

// send the contract to the server
contract.ship(function(results){

})
```

## save example
```js

var warehouse = $digger.connect('/my/warehouse');

warehouse('product:limit(1)').ship(function(product){
	product.attr('price', 10);
	var contract = product.save();
	contract.ship(function(){
		// product is saved
	})
})
```

## remove example
```js

var warehouse = $digger.connect('/my/warehouse');

warehouse('product:limit(1)').ship(function(product){

	var contract = product.remove();
	contract.ship(function(){
		// product is removed with all children also removed
	})
})
```