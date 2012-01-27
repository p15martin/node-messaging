var amqp = require( "amqp" );

exports.createMessenger = function() {
	return new Messenger();
}

var NON_PERSISTENT = 1;

function Messenger() {
	this.connection = null;
	this.exchange = null;
	this.queue = null;
}

Messenger.prototype.createConnection = function( url, callback ) {
	this.connection = amqp.createConnection( { url: url } );

	this.connection.addListener( "ready", function() {
		if ( callback ) {
			callback();
		}
	});
	
	this.connection.addListener( "close", function() {
		console.log( "Connectin to RabbitMQ closed" );

		if ( callback ) {
			callback();
		}
	});


	this.connection.addListener( "error", function( error ) {
		// console.log( "Error: %s", error.message );

		if ( callback ) {
			callback( error );
		}
	});
}

Messenger.prototype.createExchange = function( exchangeName, exchangeOptions, callback ) {
	// TODO if no connection throw error

	this.exchange = this.connection.exchange( exchangeName, exchangeOptions, function( exchange ) {
		console.log( "Exchange '%s' is open", exchange.name );
		
		if ( callback ) {
			callback();
		}
	});
}

Messenger.prototype.createQueue = function( queueName, callback ) {
	// TODO if no connection throw error
	
	this.queue = this.connection.queue( queueName, function ( queue ) {
		console.log( "Queue '%s' is open", queue.name );

		if ( callback ) {
			callback();
		}
	});
}

Messenger.prototype.bindQueueToExchange = function( bindingKey, callback ) {
	// TODO if no exchange throw error

	this.queue.bind( this.exchange.name, bindingKey );

	if ( callback ) {
		callback();
	}
}

Messenger.prototype.publish = function( routingKey, message ) {
	// TODO if no exchange throw error

	this.exchange.publish( routingKey, message );
}

Messenger.prototype.subscribe = function( messageHandler ) {
	// TODO if no queue throw error

	this.queue.subscribe( messageHandler );
}