var async = require( "async" );
var Messenger = require( "./internal/messenger" );

exports.createConsumer = function() {
	return new Consumer();
}

function Consumer() {
	var messenger;

	this.initialize = function( url, exchangeName, exchangeOptions, queueName, bindingKey, callback ) {
		messenger = Messenger.createMessenger();

		async.series([
				function( callback ) { createConnection( url, callback ) },
				function( callback ) { createExchange( exchangeName, exchangeOptions, callback ) },
				function( callback ) { createQueue( queueName, callback ) },
				function( callback ) { bindQueueToExchange( bindingKey, callback ) },
			],
			function( error ) {
				if ( error )
					console.log( "there is an error" );

				if ( callback ) {
					callback();
				}
			}
		);
	}

	this.subscribe = function( messageHandler ) {

		// TODO we need an error if there is no messenger
		messenger.subscribe( messageHandler );
	}

	function createConnection( url, callback ) {
		messenger.createConnection( url, function() {
			callback();
		});
	}

	function createExchange( exchangeName, exchangeOptions, callback ) {
		messenger.createExchange( exchangeName, exchangeOptions, function() {
			callback();
		});
	}

	function createQueue( queueName, callback ) {
		messenger.createQueue( queueName, function() {
			callback();
		});
	}

	function bindQueueToExchange( bindingKey, callback ) {
		messenger.bindQueueToExchange( bindingKey, function() {
			callback();
		});
	}
}

Consumer.prototype.connect = function( url, exchangeName, exchangeOptions, queueName, bindingKey, callback ) {
	this.initialize( url, exchangeName, exchangeOptions, queueName, bindingKey, callback );
}

Consumer.prototype.receiveMessages = function( messageHandler ) {
	this.subscribe( messageHandler );
}