var amqp = require( "amqp" );
var EventEmitter = require('events').EventEmitter;

exports.createMessenger = function( url, callback ) {

	var messenger = new Messenger( url );

	messenger.openConnection( function() {
		callback( messenger );
	});
}

exports.Messenger = Messenger;

function Messenger( url ) {
	var connection = null;
	var connectionPending = false;
	var self = this;

	this.openConnection = function ( callback ) {
		if ( this.getConnection() || connectionPending ) {
			throw new MessengerError( "The connection is already open" );
		} else {
			createConnection( url, function() {
				if ( callback )	{
					callback();
				}
			});
		}
	}

	this.openExchange = function( exchangeName, exchangeOptions, callback ) {
		if ( this.getConnection() == null ) {
			throw new MessengerError( "You must have a connection before opening an exchange" );
		}

		createExchange( exchangeName, exchangeOptions, function() {
			if ( callback )	{
				callback();
			}
		});
	}

	this.openQueue = function( queueName, queueOptions, callback ) {
		if ( this.getConnection() == null ) {
			throw new MessengerError( "You must have a connection before opening a queue" );
		}

		createQueue( queueName, queueOptions, function() {
			if ( callback )	{
				callback();
			}
		});
	}

	this.bindQueueToExchange = function( bindingKey, queueName, exchangeName ) {
		if ( this.getConnection() == null ) {
			throw new MessengerError( "You must have a connection before binding a queue to an exchange" );
		}

		console.info( "Binding queue '%s' to exchange '%s' using '%s'", queueName, exchangeName, bindingKey );

		this.getConnection().queues[ queueName ].bind( exchangeName, bindingKey );
	}

	this.publish = function( exchangeName, routingKey, message, messageOptions ) {
		if ( this.getConnection() == null ) {
			throw new MessengerError( "You must have a connection before publishing a message" );
		}

		var exchange = this.getConnection().exchanges[ exchangeName ];

		if ( exchange ) {
			exchange.publish( routingKey, message, messageOptions );
		} else {
			self.emit( "noExchange", exchangeName );
		}
	}

	this.subscribe = function( queueName, subscribeOptions, messageHandler ) {
		if ( this.getConnection() == null ) {
			throw new MessengerError( "You must have a connection before subscribing" );
		}

		console.info( "Subscribing to queue '%s'", queueName );

		var queue = this.getConnection().queues[ queueName ];

		if ( queue ) {
			queue.subscribe( subscribeOptions, messageHandler );	
		} else {
			self.emit( "noQueue", queueName );
		}
	}

	this.getConnection = function() {
		return connection;
	}

	this.getNamedExchange = function( exchangeName ) {
		if ( this.getConnection() == null ) {
			throw new MessengerError( "You must have a connection before returning an exchange" );
		}
		
		return this.getConnection().exchanges[ exchangeName ];
	}


	this.getNamedQueue = function( queueName ) {
		if ( this.getConnection() == null ) {
			throw new MessengerError( "You must have a connection before returning a queue" );
		}
		
		return this.getConnection().queues[ queueName ];
	}

	function MessengerError( message ) {
       	Error.call( this );
        Error.captureStackTrace( this, this.constructor );

        this.name = this.constructor.name;
        this.message = message;
    }

	MessengerError.prototype.__proto__ = Error.prototype;

	function createConnection( url, callback ) {
		console.info( "Connecting to '%s'...", url );

		connectionPending = true;

		var pendingConnection = amqp.createConnection( { url: url } );

		pendingConnection.on( "ready", function() {
			console.info( "Successfully connected to '%s'", url );

			connection = pendingConnection;

			connectionPending = false;

			callback();
		});

		pendingConnection.on( "close", function() {
			console.info( "Connection closed to '%s'...", url );

			onClose();
		});

		pendingConnection.on( "error", function( error ) {
			console.info( "Error '%s' on connect '%s'", error.message, url );

			onError( error );
		});
	}

	function createExchange( exchangeName, exchangeOptions, callback ) {
		console.log( "Opening exchange '%s'...", exchangeName );

		self.getConnection().exchange( exchangeName, exchangeOptions, function( exchange ) {
			console.log( "Exchange '%s' is open", exchange.name );

			exchange.on( "close", function() {
				console.log( "Exchange '%s' has been closed", exchange.name );

				onClose();
			});

			exchange.on( "error", function( error ) {
				console.log( "Exchange '%s' has an error '%s'", exchange.name, error.message )

				onError( error );
			});

			callback();
		});
	}

	function createQueue( queueName, queueOptions, callback ) {
		console.log( "Opening queue '%s'...", queueName );

		self.getConnection().queue( queueName, queueOptions, function ( queue ) {
			console.log( "Queue '%s' is open", queue.name );

			queue.on( "close", function() {
				console.log( "Queue '%s' has been closed", queue.name );

				onClose();
			});

			queue.on( "error", function( error ) {
				console.log( "Queue '%s' has an error '%s'", queue.name, error.message )

				onError( error );
			});

			callback();
		});
	}

	function onError( error ) {
		self.emit( "error", error );
	}

	function onClose() {
		self.emit( "close" );
	}
}

Messenger.prototype.__proto__ = EventEmitter.prototype;

Messenger.prototype.openAndSubscribe = function( exchangeName, exchangeOptions, queueName, queueOptions, bindingKey, subscribeOptions, messageHandler ) {
	console.log( "Opening and subscribing...." );

	var self = this;

	this.openExchange( exchangeName, exchangeOptions, function() {
		self.openQueue( queueName, queueOptions, function() {
			self.bindQueueToExchange( bindingKey, queueName, exchangeName );
			self.subscribe( queueName, subscribeOptions, messageHandler );
		});
	});
}

Messenger.prototype.openForPublish = function( exchangeName, exchangeOptions, callback ) {
	console.log( "Opening for publish...." );

	var self = this;

	self.openExchange( exchangeName, exchangeOptions, function() {
		if ( callback )	{
			callback();
		}
	});
}