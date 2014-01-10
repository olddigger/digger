#Quickstart - node.js

You can run digger as a stand-alone node.js application or as part of your own app.

###1. Install
You install digger as an npm module:

```bash
$ npm install digger -g
```

You also need a [Mongo](http://www.mongodb.org/) and [Redis](http://redis.io/) server running locally.

You can use [quarry](https://github.com/binocarlos/quarry) which uses [Docker](http://docker.io) to run digger inside containers.

###2. digger.yaml

Create a digger.yaml in the root folder of your application.

This will describe the layout of your stack.  The following is a small example:

```yaml
# a mongo database mounted on the '/my/database' path
/my/database:
	# the module is either local code path or an npm module
  module: digger-mongo
  # configure the warehouse
  config:
  	database: my_database
  	collection: table1

# a web application
www:
	# where to serve from
	document_root: ./www
	# what domains match this virtual host
	domains:
		- "localhost"
		- "mywebsite.com"
	# middleware handlers - we tell digger to run from /api/v1
	handlers:
		/api/v1:
			module: digger
```

###3. package.json
In the above example we have used the **digger-mongo** module.

This is an npm module and so we must install it first.

```bash
$ npm install digger-mongo --save
```

It is important that the module is specified in your package.json for when we come to deploy the stack.

###4. digger build
Once you have created a digger.yaml file describing your stack - you must build it.

Run digger build from within the application folder (the same folder that has digger.yaml):

```bash
$ digger build
```

This will create a .quarry folder - it is a good idea to add .quarry to your .gitignore and .npmignore files.

###5. digger run
Once built the stack is ready to run.

Make sure you have your database servers (Redis & Mongo) started.

If you are using quarry - you can type:

```bash
$ quarry devservices
```

And it will boot the services your stack requires.

To run your digger stack type:

```bash
$ sudo digger run
```

It will trace what modules it is creating and providing there are no problems, your stack is running.

###6. quarry deploy
If you have installed quarry on a remote server (and have followed the installation instructions) - you will be able to push your digger stack to it.

First - we add the quarry server as a remote:

```
$ git remote add quarry git@myserver.com:myreponame
```

Where myserver.com is the hostname of the server you have installed quarry and myreponame is the label you are giving your app.

Then - to deploy your app live:

```
$ git push quarry master
```

quarry will recieve the git push - load the application into docker containers, boot your databases and keep your app running.


