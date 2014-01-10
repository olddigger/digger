#Selectors

The selector API is based roughly on the CSS3 selector API with a couple of exceptions.

### Universal selector

'*'	any element

```js
$digger('*')
	.ship(function(allthings){

	})
```

## Core selectors

### Type selector

E	an element of _digger.tag E

```js
$digger('product')
	.ship(function(allproducts){

	})
```

### Class selectors

E.onsale	an E element whose _digger.class is "onsale"

```js
$digger('.onsale')
	.ship(function(onsale_items){

	})
```

### ID selectors

E#foodshop	an E element with _digger.id equal to "foodshop".

```js
$digger('#foodshop')
	.ship(function(food_folder){

	})
```

### DiggerID selectors

E=123	an E element with _digger.diggerid equal to "123".

```js
$digger('=123')
	.ship(function(specific_container){

	})
```

## Attribute selectors

### [attr] - Attribute selectors

E[foo]	an E element with a "foo" attribute

```js
$digger('[foo]')
	.ship(function(foo_container){

	})
```

### [attr=bar] - Attribute selectors

E[foo="bar"]	an E element whose "foo" attribute value is exactly equal to "bar" (case-insensitive)

```js
// this means model.height==34
var string1 = '[foo=bar]';
var string2 = '[foo="bar"]';
var boolean = '[foo=true]';
var float = '[foo=34.4]';
```

### [attr!=bar] - Attribute selectors

E[foo!="bar"]	an E element whose "foo" attribute value is not equal to exactly "bar" (case-insensitive)

```js
// this means model.height==34
var string1 = '[foo!=bar]';
var string2 = '[foo!="bar"]';
var boolean = '[foo!=true]';
var float = '[foo!=34.4]';
```

### [attr~=bar] - Attribute selectors

E[foo~="bar"]	an E element whose "foo" attribute value is a list of whitespace-separated values, one of which is exactly equal to "bar"

```js
// this means model.fruit contains something like "orange apple"
var selector = '[fruit~="apple"]';
var selector = '[fruit~=apple]';
```

### [attr^=bar] - Attribute selectors

E[foo^=bar]	an E element whose "foo" attribute value begins exactly with the string "bar"

### [attr$=bar] - Attribute selectors

E[foo$=bar]	an E element whose "foo" attribute value ends exactly with the string "bar"	

### [foo*=bar] - Attribute selectors

E[foo*="bar"]	an E element whose "foo" attribute value contains the substring "bar"	

### [attr|=en] - Attribute selectors

E[foo|=en]	an E element whose "foo" attribute has a hyphen-separated list of values beginning (from the left) with "en"


### [attr<>=val] - attribute greater/less than/equals

the [attr>val] selector is greater than test

this also applies to:

 * [attr>val] - greater than
 * [attr>=val] - greater than or equal
 * [attr<val] - less than
 * [attr<=val] - less than or equal

```js
// this means model.height greater than or equal to 34
var selector = '[height>=34]';
```



##Combinators

## Descendant combinator

E F	an F element descendant of an E element

```js
$digger('#shop product')
	.ship(function(allproducts){

	})
```

## Child combinator

E > F	an F element child of an E element

```js
$digger('#shop > product')
	.ship(function(childproducts){

	})
```

##Pseudo-classes

### Negation 

e.onsale:not an E element that matches but negates (i.e. matches if the selector is NOT true)

```js
$digger('#shop > product.onsale:not')
	.ship(function(not_onsale_products){

	})
```

### Tree 

e.onsale:tree an E element that loads all it's children along with itself

```js
$digger('#shop > product:tree')
	.ship(function(products_with_children){

	})
```

### Tree(selector)

e.onsale:tree(S) an E element that loads all it's children that match selector S - along with itself

```js
$digger('#shop > product:tree(review.recent)')
	.ship(function(products_with_recent_reviews){

	})
```

### Sort

e:sort(name) E elements sorted by their name field

```js
$digger('#shop > product:sort(name)').ship(function(sorted_products){

})
```

### Limit

e:limit(number) E elements limited to 'number'
e:limit(start,number) E elements limited to 'start,number'

```js
$digger('#shop > product:limit(50)').ship(function(fifty_products){

})
```