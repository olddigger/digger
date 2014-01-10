#Blueprint Format

The blueprint format in digger is a very simple XML structure.

The elements are:

 * blueprint - the top level 'thing'
 * field - each blueprint has a list of fields
 * option - the list of options for select and radio fields
 * tab - each blueprint can have a list of tabs - each tab can have a list of fields


An example of the most basic blueprint with 1 field - 'name':

```xml
<blueprint name="mything">
	<field name="name" />
</blueprint>
```

###Blueprint Attributes

The top level blueprint element can have the following properties:

####name
The name is how the blueprint will be referenced and can be any string.  If there is no **tag** attribute then the name is used as the tag.

####tag
The tag will be assigned to the container created from the blueprint.

Here is a blueprint known as 'My Big Blueprint Title' but that will create a 'thing' container.

```xml
<blueprint name="My Big Blueprint Title" tag="thing" />
```

Here is a blueprint that uses the name for the tag:

```xml
<blueprint name="thing" />
```

This is invalid (because there is no tag - the name cannot have spaces):

```xml
<blueprint name="The name cannot have spaces without a tag" />
```

####class
The class attribute of the blueprint will be assigned to the new container:

```xml
<blueprint name="Citrus Fruit" tag="fruit" class="citrus">
	<field name="name" />
</blueprint>
```

####leaf
The leaf attribute of the blueprint means that no children can be added to the container:

```xml
<blueprint name="stat" leaf="true">
	<field name="value" />
</blueprint>
```

####children
The children attribute controls what other blueprints can be added to this one.

The names are split by comma and only those blueprints are allowed as children.

```xml
<blueprint name="statgroup" children="stat">
	<field name="name" />
</blueprint>
```

###Fields
Each blueprint has an array of fields that control what will appear on the form.

Each field has 2 core properties:

 * name - what property of the model the field will edit
 * type - what type will be rendered

For example - if we wanted to edit the 'comments' property of a container and have a 'textarea' appear for it:

```xml
<field name="comments" type="textarea" />
```

You can nest fieldnames with dots.

```xml
<field name="address.street" />
<field name="address.city" />
<field name="address.postcode" />
```

This example would create an 'address' object with 3 properties inside.  The default type is 'text'.

####Labels
You can have a different label from the fieldname:

```xml
<field name="ahqr" title="App Hours Queue Rate" />
```

####Field Types
There are a number of built-in fieldtypes:

 * text
 * url
 * number
 * money
 * email
 * textarea
 * diggerclass
 * diggericon
 * template
 * checkbox
 * radio
 * select
 * diggerurl
 * file

Here is an example blueprint with 3 fields of different types:

```xml
<blueprint name="mything">
	<field name="name" />
	<field name="price" type="money" />
	<field name="description" type="textarea" />
</blueprint>
```

####Lists
A field can be a list of values - to turn a field into a list add list="true" to the XML:

```xml
<blueprint name="mything">
	<field name="name" />
	<field name="notes" type="text" list="true" />
</blueprint>
```

####Tabs
Tabs group other fields or can display a single field.

To have a tab with some fields:

```xml
<blueprint name="mything">
	<field name="name" />
	<tab name="address">
		<field name="address.street" />
		<field name="address.city" />
		<field name="address.postcode" />
	</tab>
</blueprint>
```

To have a tab that is a single field:

```xml
<blueprint name="mything">
	<field name="name" />
	<tab name="notes" type="textarea" />
</blueprint>
```

To have a tab that is a single list:

```xml
<blueprint name="mything">
	<field name="name" />
	<tab name="notes" type="text" list="true" />
</blueprint>
```

####Options
The radio and select types need an array of options to fill.

The simplest way is to add them to the field.

You can do this either with a csv string:

```xml
<blueprint name="mything">
	<field name="name" />
	<field name="food" type="select" options_csv="cake,fruit,pasta" />
</blueprint>
```

Or with nested option elements:

```xml
<blueprint name="mything">
	<field name="name" />
	<field name="food" type="select">
		<option value="cake" />
		<option value="fruit" />
		<option value="pasta" />
	</field>
</blueprint>
```

Another way to fill options is to load them from a digger query.

Here is an example of populating a select list with the countries from a warehouse:

```xml
<blueprint name="mything">
	<field name="name" />
	<field name="country" type="select" options_warehouse="binocarlos/countries" options_selector="country:sort(name)" />
</blueprint>
```

####Templates
For single page applications you can also include custom field types in the form of a template.

Digger fields use angular and so templates are in angular markup - the **model** and **fieldname** properties of the scope are used to write to the container.

Here is a custom radio button as an example template:

```html
<script type="digger/field" name="customradio">
	<div>
		<button class="btn" ng-class="{'btn-primary':!model[fieldname]">No</button>
		<button class="btn" ng-class="{'btn-primary':model[fieldname]">Yes</button>
	</div>
</script>
```

And here is a blueprint that uses that template:

```xml
<blueprint name="mything">
	<field name="name" />
	<field name="active" type="customradio" />
</blueprint>
```

####Components
Digger components enable you to a GitHub repository as a field type.

Here is an example of using the ace-editor as a field type:

```xml
<blueprint name="webpage">
	<field name="name" />
	<field name="html" type="binocarlos/ace-editor" />
</blueprint>
```

Digger will download the component - build it and inject it into the field.
