# Loading Data

Digger works by turning each container into a function that 'selects' models below it from the database.

This means a container is like a place-holder for future queries from that point in the tree.

You can also load data in trees from the server in one go.

Traversing local data and loading remote data is how you work with digger - it leaves the choice of when you do each bit up to you.

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

## Shipping Contracts

When you run a container as a function, passing a selector, it will return a contract.

The contract can be combined with other contracts or altered.  Ultimately, once it has been properly prepared, the contract
will want to be sent to the server and executed.

This is done with the **ship** method you get with each contract.

Calling the ship method means 'send this contract to the server to be executed'.

This example loads data from the warehouse and then runs a second contract using the first model from the results as the base.

This means 'load all reviews that live inside the first product'.

```js
var warehouse = $digger.connect('/my/warehouse');

var contract = warehouse('product[price<100]');

contract.ship(function(products){
	// products are loaded here
	// products is a container with the results as its models

	// get the first product
	var first_product = products.eq(0);

	// load reviews below it
	var child_contract = first_product('review');
	child_contract.ship(function(reviews){
		// reviews is a container
	})
})
```

If the reviews are all we wanted to load - we would be much better doing it in one selector - this avoids multiple round trips:

Also - we can chain the ship function for more compact code:

```js
var warehouse = $digger.connect('/my/warehouse');

warehouse('product[price<100]:limit(1) review').ship(function(reviews){
	// reviews is a container of the first products reviews
})
```