#Quickstart - JavaScript

###1. Warehouse / Access / Data
First you need to [create a warehouse](./user-gettingstarted).

Then, [collaborate](./user-collaboration) it with your client.

Then [create a blueprint](./user-blueprints) for the things the client wants to add.

In our simple example we have created a [countries](http://digger.io/binocarlos/countries) warehouse.

###2. Include digger on your page

Install the warehouse onto our page by pointing to it as follows:

```html
<script src="http://digger.io/api/v1/binocarlos/countries.min.js"></script>
```

###3. Run a selector

The **$digger** variable is now on our page - this means we can run selectors and ship them.

We know our database has countries - lets load them sorted by name:

```javascript
$digger('country:sort(name)')
	.ship(function(countries){
		console.log(countries.count() + ' countries loaded');
	})
```

###4. Append Data

We can add data to the database by running an **append** contract:

```javascript
var new_country = $digger.create('country', {
	"name":"Bermuda Triangle",
	"code":"?"
})

$digger.append(new_country).ship(function(){
	console.log(new_country.title() + ' added');
})
```

###5. Radio

Listen for changes to the data:

```javascript
var warehouse_radio = $digger.radio();

warehouse_radio.listen(function(packet){
	console.log('warehouse changed');
})


var new_country = $digger.create('country', {
	"name":"Bermuda Triangle",
	"code":"?"
})

$digger.append(new_country).ship(function(){
	console.log(new_country.title() + ' added');
})
```

###5. Connect to other warehouses

If you want to write a multi-warehouse app, you need to use the following digger script tag:

```html
<script src="http://digger.io/api/v1.min.js"></script>
```

And then connect to warehouses as you want - this example merges together results from 2 warehouses in 1 query:

```javascript
var warehouse1 = $digger.connect('/binocarlos/countries');
var warehouse2 = $digger.connect('/binocarlos/films');

$digger.merge(
	warehouse1('country'),
	warehouse2('film')
).ship(function(results){
	// results is countries and films
})
```