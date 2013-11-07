## container

A container is just a wrapper for an array of models.

## contract

Instructions for a sequence of requests to be dispatched in a certain manner.

## reception

The beating heart of the network - front door HTTP server.

## contract resolver

Resolves contracts in sequence

## supplier

A database warehouse that speaks selectors.

## warehouse

A generic REST handler in an express style.

## switchboard

The pub/sub server

## supplychain

Connects containers to middleware handlers.

## bridge

Connects HTTP requests onto pure JavaScript requests

## portal

A radio listener connected to a container warehouseurl + diggerid

## radio

A pub/sub handler trigger - network wide

## threadserver

A safe envrionment to run user scripts that are provided with a supplychain back onto the network.

## appserver

Serves a digger website with tags trigger server-side replacement

## stack

Runs a digger network booting each service inside a docker container

## stack monitor

App for root user that looks after running stacks




###Software is eating the world

Marc Andresson [famously said](http://online.wsj.com/article/SB10001424053111903480904576512250915629460.html) this and a few years later, the software is [getting fat](http://www.technologyreview.com/featuredstory/515926/how-technology-is-destroying-jobs).

The world has a growing gap between those who can work computers and those who cannot. Even within technology circles there is a big pay difference between someone who can design a webpage and someone who can program a database.

As we go full-speed into the digital era - we have a need for tools that allow less technical people to manipulate data (and databases).

###JQuery ate the web designers
JQuery is used on more than [half of ALL webpages](http://www.sitepoint.com/jquery-used-on-50-percent-of-websites/) on the Internet.

It is astonishing for a JavaScript library (where there are tens of thousands of choices) to dominate in such a manner.

There is good reason for this success: **CSS Selectors**.  By leveraging CSS, JQuery became usable by many millions more people - web designers started programming JavaScript!

###Abstractions

JQuery is a good example of an **abstraction** - hiding away the complex details so a user is in control and using a familiar interface.

Computers are only useful because of these abstractions.  Imagine if we had to use [Maxwells equations](http://en.wikipedia.org/wiki/Maxwell's_equations) each time we wanted to read an email!

digger abstracts away connecting to and querying database servers behind a layer that looks a lot like JQuery.

It does this in the hope that by enabling more people to use databases, little by little we can close the skills gap.

digger is not the ultimate nor fastest database around.  It is however, very easy to work with and can do a whole bunch of stuff well and some stuff very badly.

We hope this becomes a 'gateway' database - that is, the first in a long line of technology used by many more people.