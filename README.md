This is a simple messaging API for AMQP, which is developed on [node-amqp](https://github.com/postwait/node-amqp).

To see how it used look at the loopback example. The concept is simple, you create a Producer to produce/send messages, and a Consumer to consume/receive messages.

This API abstracts all the creation of the connection, the exchange, the queue, etc.