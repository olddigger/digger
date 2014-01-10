#What is digger?

digger is a database system where data can be nested and you search for it using CSS selectors.

You can run your own digger server or connect your web-page to a warehouse hosted on digger.io.

The purpose of digger is to make it easy to create simple database apps.

If more people write apps - their knowledge of the world is encoded into computer programs - a good thing for everyone.

digger is a 'gateway' database - start using it and soon you'll confidently be onto 'harder' databases.

If you are already a seasoned database programmer (or anywhere in between) - start writing [digger suppliers](https://github.com/binocarlos/digger-supplier) which means everyone else can talk to your database using digger.


##Data

###Databases

Databases help you to manipulate the data that lives in a file on your computer(*).  Open a spreadsheet in Excel - change a value and save the spreadsheet.  You just wrote to a database!

Exotic database servers do the same thing just more efficiently.

Where a spreadsheet has a **row**, a database has a **record**.  Records are the 'things' in your database.

Ask the database a question and it will answer with a list of records.  In programming speak - this is an **array** of results.

```js
[{
  "name":"Superman",
  "rating":9.4
},{
  "name":"Spiderman",
  "rating":9.5
},{
  "name":"Yoda",
  "rating":11
}]
```

###JQuery Results

JQuery does a similar thing.  You feed it a CSS Selector as a question and it returns an array of DOM elements (instead of JSON objects).

```html
<div id="holder">
  <img class="loadme" src="img.gif" />
  <div class="loadme">hello!</div>
  <a class="loadme" href="http://digger.io">click me</a>
</div>
```

Above we have 3 DOM elements inside a parent - they are all different - this scenario is a nightmare for most databases (but browsers love it).

JQuery also loves a tree structure - you can give it CSS and it returns a container for your results:

```js
$(function(){
  var records = $('#holder > .loadme');
  // records is an array of 3 DOM elements
})
```

JQuery shines because it hides away details like **what** is in the list and **how long** the list is.

For every question you ask JQuery, it returns a **container** with some stuff inside.

##Selectors

digger is a **document database** - a digger warehouse is a bit like one massive **DOM**.

Web designers are already used to using CSS selectors to query a DOM - digger uses the same idea but for server DOMS (i.e. digger warehouses).

CSS selectors have the following main elements:

 * tag - div
 * class - .red
 * id - #mything
 * attr - [name=x]
 * modifier - :first

These elements can be mapped onto a database table:

 * tab - table name
 * class - group name
 * id - primary key
 * attr - fields
 * modifier - order by

So - if we do this selector:

```css
person.cool[age=24]
```
We are saying:

```
The model 'is a' person and in the cool 'group' and with 'attribute' age=24
```

[Read more about the selector api](docs-selector)

##Containers

A digger container is very close to a JQuery one - the main difference:

 * they wrap an array of pure JavaScript Objects not DOM elements

Take our data from above:

```js
var data = [{
  name:"Superman",
  rating:9.4
},{
  name:"Spiderman",
  rating:9.5
},{
  name:"Yoda",
  rating:11
}]
```

We can create a digger container from it:

```js
var container = $digger.create(data);
```
We can now manipulate our data via the container:

```js
// set the tag for all 3 models
container.tag('hero');

// add a class to the 2nd in the array
container.eq(1).addClass('cool');

// get array of ratings
var ratings = container.map(function(hero){
  return hero.attr('rating');
})
```
[Read more about the container api](docs-container)

##Requests

Because the database part of digger is in a different part of the world to where we want the data - we have to move 'requests' around to ask for the data.

REST and HTTP are the default protocols for digger requests - here is an example of a request to append some data to another container (diggerid 123):

```js
{
  "method":"post",
  "url":"/my/warehouse/123",
  "body":{
    "name":"my thing",
    "_digger":{
      "tag":"thing"
    }
  }
}
```

[Read more about digger requests container api](docs-requests)

##Contracts

With the ability to connect to several warehouses and generally do backflips around the Internet, there is the need for a way to co-ordinate the process and return an answer when everything is done.

The job of a contract is to allow the user to ask a question (perhaps with 6 or 7 parts to it) and to return a **promise** that the data will be returned.

The promise is **resolved** when the **whole** contract has resolved.

The 2 types of contract:

 * **Merge** - takes multiple questions and merges all the results into one array
 * **Pipe** - takes multiple questions and passes the results of each step to the next step

You can also nest contracts within each other.  So you can say:

 1. Take the answer from A and give it to B (pipe contract).
 2. Meanwhile do the same to C and D (another pipe).
 3. Finally merge the results of the 2 pipes into the final output (merge contract).

The format for a contract is simple a digger request posted to /reception with an array of other requests as the body.

Here is an example of a merge contract with 2 parts:

```json
{
  "method":"post",
  "url":"/reception",
  "headers":{
    "x-contract-type":"merge"
  },
  "body":[{
    "method":"get",
    "url":"/warehouse/1"
  },{
    "method":"get",
    "url":"/warehouse/2"
  }]
}
```

[Read more about contracts](docs-contracts)

##Reception

The digger reception is the middleman between user contracts and backend warehouses.

It's job is to **resolve** the contract by looping and waiting for the steps it contains.

It also performs **routing** - the task of knowing where our warehouses are so we can talk to them.

Everything that travels to a warehouse must go via the reception (this is hardwired into the network).

This means that there are no backdoors to the warehouses and if the guy at reception says 'You shall not pass!', [like Gandalf](http://www.youtube.com/watch?v=V4UfAL9f74I), he means it.

[Read more about reception](docs-reception)

##Warehouses

When you use digger to fetch data from the server - you target a specific **warehouse**.

You can combine many warehouses into a single digger application.  Each warehouse has a **path** - these are just like filepaths on your computer but instead point to database servers.

**/mainproject/data/log** is an example of a warehouse path.

[Read more about warehouses](docs-warehouses)

##Suppliers

**Suppliers** connect to warehouses to provide them with data.

Suppliers specialize in different types of data and selectors - the Facebook supplier knows about **friend** and **status** and the Nasdaq supplier knows about **stock** selectors.

A useful feature of digger is to be able connect multiple suppliers that respond to the same selector.

For example, if I plugin Facebook, Google+ and LinkedIn suppliers to a warehouse location and then use the **friend** selector - I have loaded data from 3 places using a single word!

[Read more about suppliers](docs-suppliers)

##Switchboard

When a user is delivered a container with their juicy data all ready for their application to consume - there is a moment in time when the contents could be deemed 'fresh'.

However - much like leaving a container of oranges for more than a few weeks - the contents of a container would get stale if not for the digger switchboard.

Every time a warehouse gets a request that **changes** data - it will broadcast that change to the switchboard.  Some suppliers take this a step further and constantly broadcast data (Twitter for example).

Containers can use the digger **radio** which subscribes to broadcasts from the switchboard and updates it's contents if it hears anything.

Containers can **broadcast** without waiting for warehouse updates - you can use this mechanism to write chat-rooms, multi-user games and realtime applications.

[Read more about the switchboard](docs-switchboard)

##Security

You can configure collaboration settings on warehouses so that only certain digger users can write data to them.

Anything that writes to a warehouse goes via the reception which checks the credentials of the user who is writing.

We have made it easy to access digger by linking with the popular social networks.  This means your client will find it easy to create their digger account - after which you can collaborate together on the project's warehouse!

[Read more about security](docs-security)

##Deployment

You can install digger and load data from any page on the Internet with zero server installations.

You can also run your own server installation for free (it's open source!) and write your own digger warehouses and generally extend it to your hearts content.

Because JavaScript runs in both browsers and the server - you can create server side scripts using the same digger code that would run in the browser.

This is useful if you don't want to expose your client code to the user - think of digger scripts as PHP for JavaScript.

[Read more about deployment](docs-deployment)