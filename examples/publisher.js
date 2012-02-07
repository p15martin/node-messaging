var messaging = require( "../lib/library" );

var url = "amqp://pbizchjy:LwmnGi9zQN1pX2yU@ydsxtmvm.heroku.srs.rabbitmq.com:23569/ydsxtmvm";
var exchangeName = "myexchange";
var exchangeOptions = { type: "topic" };
var routingKey = "my.data";
var messageOptions = { immediate: true };
var publish = true;
var messageCount = 0;

messaging.createMessenger( url, function( messenger ) {
	addCloseHandler( messenger );
	addErrorHandler( messenger );
	addNoExchangeHandler( messenger );
	openForPublish( messenger );
});

function openForPublish( messenger ) {
	messenger.openForPublish( exchangeName, exchangeOptions, function() {
		setInterval( function () {
			sendMessage( messenger );
			
		}, 200);
	});
}

function sendMessage( messenger ) {
	if ( publish ) {
		console.log( "Sending message '%d'", messageCount );
		messenger.publish( exchangeName, routingKey, { body: "hello world #" + messageCount++ }, messageOptions );	
	}
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

function addNoExchangeHandler( messenger ) {
	messenger.on( "noExchange", function( exchangeName ) {
		publish  = false;

		messenger.openExchange( exchangeName, exchangeOptions, function() {
			publish = true;
		});
	});	
}