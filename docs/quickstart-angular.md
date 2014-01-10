#Quickstart - Angular

###1. Warehouse / Access / Data
First you need to [create a warehouse](./user-gettingstarted).

Then, [collaborate](./user-collaboration) it with your client.

Then [create a blueprint](./user-blueprints) for the things the client wants to add.

In our simple example we have created a [countries](http://digger.io/binocarlos/countries) warehouse.

###2. Include digger on your page

We install the warehouse onto our page by pointing to it as follows:

```html
<script src="http://digger.io/api/v1/binocarlos/countries.angularminplus.min.js"></script>
```

The above tag includes minimal digger (no forms) + angular.

###3. Run a selector

The following html would list all countries in a list:

```html
<ul digger selector="country:sort(name)">
	<li digger-repeat>{{ $digger.title() }}</li>
</ul>
```

###4. Connect to other warehouses

If you want to write a multi-warehouse app, you need to use the following digger script tag:

```html
<script src="http://digger.io/api/v1.angularminplus.min.js"></script>
```

You then use the **warehouse** directive as follows:

```html
<h1>My Films</h1>
<ul digger warehouse="/binocarlos/films" selector="country:sort(name)">
	<li digger-repeat>{{ $digger.title() }}</li>
</ul>

<h1>Countries</h1>
<ul digger warehouse="/binocarlos/countries" selector="country:sort(name)">
	<li digger-repeat>{{ $digger.title() }}</li>
</ul>
```

###5. Using Angular directives

You can also use the normal angular directives.  The current container is always **$digger** in the current scope.

For example - lets only show the (*) if the film has a class 'good' (using the angular ng-if directive):

```html
<h1>My Films</h1>
<ul digger warehouse="/binocarlos/films" selector="country:sort(name)">
	<li digger-repeat>{{ $digger.title() }} <span ng-id="$digger.hasClass('good')">(*)</span></li>
</ul>

```