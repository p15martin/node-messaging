Introduction
===========

This is a simple messaging API for AMQP. It wraps [node-amqp](https://github.com/postwait/node-amqp) to provide convenience methods for publishing and subscribing. For the developer it abstracts all the mechanics concerning the connection, exchanges, queues, and binding.

Although the API provides an abstraction, it does not prevent the developer from dropping down a level and working directly with the connection, exchanges, or queues. There are functions to obtain references to each of these. Nor does it change the behaviour of [node-amqp](https://github.com/postwait/node-amqp), the same configuration options apply as does the associated documentation.

Installation
------------

	npm install messaging


Running the tests
-----------------

Install the package dependencies:

        npm install

Install [Buster](http://busterjs.org/):

        sudo npm install –g buster

(if you have problems installing Buster then please refer to this [page](http://busterjs.org/docs/getting-started/))

Run the tests:

        buster test


