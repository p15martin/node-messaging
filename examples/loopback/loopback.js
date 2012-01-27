var messaging = require( "../../lib/library" );

var url = "amqp://pbizchjy:LwmnGi9zQN1pX2yU@ydsxtmvm.heroku.srs.rabbitmq.com:23569/ydsxtmvm";
var exchangeName = "myexchange";
var exchangeOptions = { type: "topic" };
var queueName = "myqueue";
var routingKey = "my.data";
var bindingKey = "my.#";

createConsumer();
createProducer();

function createConsumer() {
	var consumer = messaging.createConsumer();

	consumer.connect( url, exchangeName, exchangeOptions, queueName, bindingKey, function() {
		consumer.receiveMessages( function( message ) {
			console.log( "Received message '%s'", message.body );
		});
	});
}

function createProducer() {
	var producer = messaging.createProducer();

	producer.connect( url, exchangeName, exchangeOptions, function() {
		var count = 0;

	   	setInterval( function () {
			producer.sendMessage( routingKey, { body: "hello world #" + count++ } );	
	   	}, 100);
	});
}