var messaging = require( "../lib/library" );

var url = "amqp://pbizchjy:LwmnGi9zQN1pX2yU@ydsxtmvm.heroku.srs.rabbitmq.com:23569/ydsxtmvm";
var exchangeName = "myexchange";
var exchangeOptions = { type: "topic" };
var queueName = "myqueue";
var queueOptions = { autoDelete: true };
var bindingKey = "my.#";
var subscribeOptions = {};

messaging.createMessenger( url, function( messenger ) {
	addCloseHandler( messenger );
	addErrorHandler( messenger );
	openAndSubscribe( messenger );
});

function openAndSubscribe( messenger ) {
	messenger.openAndSubscribe( exchangeName, exchangeOptions, queueName, queueOptions, bindingKey, subscribeOptions, function( message ) {
		console.log( "Received message '%s'", message.body );
	});	
}

function addCloseHandler( messenger ) {
	messenger.on( "close", function() {
		console.log( "Close event propogated" );
	});
}

function addErrorHandler( messenger ) {
	messenger.on( "error", function( error ) {
		console.log( "Error event propogated" );
	});	
}