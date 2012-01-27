var async = require( "async" );
var Messenger = require( "./internal/messenger" );

exports.createProducer = function() {
	return new Producer();
}

function Producer() {
	var messenger;

	this.initialize = function( url, exchangeName, exchangeOptions, callback ) {
		messenger = Messenger.createMessenger();

		async.series([
				function( callback ) { createConnection( url, callback ) },
				function( callback ) { createExchange( exchangeName, exchangeOptions, callback ) },
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

	this.publish = function( routingKey, message ) {
		messenger.publish( routingKey, message );
	}

	function createConnection( uri, callback ) {
		messenger.createConnection( uri, function() {
			callback();
		});
	}

	function createExchange( exchangeName, exchangeOptions, callback ) {
		messenger.createExchange( exchangeName, exchangeOptions, function() {
			callback();
		});
	}
}

Producer.prototype.connect = function( url, exchangeName, exchangeOptions, callback ) {
	this.initialize( url, exchangeName, exchangeOptions, callback );
}

Producer.prototype.sendMessage = function( routingKey, message ) {
	this.publish( routingKey, message );
}