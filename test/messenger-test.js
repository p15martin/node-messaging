var buster = require("buster");
var amqp = require( "amqp" );
var EventEmitter = require('events').EventEmitter;
var Messenger = require("../lib/messenger");

buster.testCase( "Test create messenger", {
    setUp: function() {
        this.connection = new EventEmitter;
        this.url = "amqp://myrabbit.mq";

        this.callback = this.spy();
    },
    "successfully": function () {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        Messenger.createMessenger( this.url, this.callback );

        this.connection.emit( "ready" );

        assert( this.callback.calledOnce );
        assert( amqpStub.called );
    }
});

buster.testCase( "Test open connection", {
    setUp: function() {
        this.connection = new EventEmitter;

        this.url = "amqp://myrabbit.mq";

        this.messenger = new Messenger.Messenger( this.url );
        this.callback = this.spy();
        this.error = new Error();
    },
    "successfully": function () {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.openConnection( this.callback );

        this.connection.emit( "ready" );

        assert( this.callback.calledOnce );
        assert( amqpStub.calledOnce );
    },
    "without callback": function () {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.openConnection();

        this.connection.emit( "ready" );

        assert.equals( this.callback.callCount, 0 );
        assert( amqpStub.called );
    },
    "throws error if connection already open": function() {
        var openConnectionSpy = this.spy( this.messenger, "openConnection" );
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        try {
            this.messenger.openConnection( this.callback );
        } catch ( error ) {}

        assert( openConnectionSpy.threw() );
    },
    "adds listener for close event": function() {
        var connectionSpy = this.spy( this.connection, "on" );

        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.openConnection();

        assert( connectionSpy.calledWith( "close" ) );
    },
    "adds listener for error event": function() {
        var connectionSpy = this.spy( this.connection, "on" );

        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.openConnection();

        assert( connectionSpy.calledWith( "error" ) );
    }
});

buster.testCase( "Test open exchange", {
    setUp: function() {
        this.messenger = new Messenger.Messenger();
        this.connection = { exchange: function() {} };

        this.exchange = { on: function() {} };
        this.exchangeName = "myexchange";
        this.exchangeOptions = { type: "topic" };
        this.exchangeStub = this.stub( this.connection, "exchange" ).withArgs( this.exchangeName, this.exchangeOptions, this.callback ).yields( this.exchange );
        this.connection.exchange = this.exchangeStub;

        this.callback = this.spy();
    },
    "successfully": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );
        this.messenger.openExchange( this.exchangeName, this.exchangeOptions, this.callback );

        assert.calledOnce( this.callback );
        assert( this.exchangeStub.calledOnce );
    },
    "without callback": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );
        this.messenger.openExchange( this.exchangeName, this.exchangeOptions );

        assert.equals( this.callback.callCount, 0 );
        assert( this.exchangeStub.calledOnce );
    },
    "throws error if there is no connection": function() {
        var openExchangeSpy = this.spy( this.messenger, "openExchange" );
        this.stub( this.messenger, "getConnection" ).returns( null );

        try {
            this.messenger.openExchange( this.exchangeName, this.exchangeOptions, this.callback );
        } catch ( error ) {}

        assert( openExchangeSpy.threw() );
    },
    "adds listener for close event": function() {
        var exchangeOnSpy = this.spy( this.exchange, "on" );
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        this.messenger.openExchange( this.exchangeName, this.exchangeOptions, this.callback );

        assert( exchangeOnSpy.calledWith( "close" ) );
    },
    "adds listener for error event": function() {
        var exchangeOnSpy = this.spy( this.exchange, "on" );
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        this.messenger.openExchange( this.exchangeName, this.exchangeOptions, this.callback );

        assert( exchangeOnSpy.calledWith( "error" ) );
    }
});

buster.testCase( "Test open queue", {
    setUp: function() {
        this.messenger = new Messenger.Messenger();
        this.connection = { queue: function() {} };

        this.queue = { on: function() {} };
        this.queueName = "myqueue";
        this.queueOptions = { autoDelete: true };
        this.queueStub = this.stub( this.connection, "queue" ).withArgs( this.queueName, this.queueOptions, this.callback ).yields( this.queue );
        this.connection.queue = this.queueStub;

        this.callback = this.spy();
    },
    "successfully": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );
        this.messenger.openQueue( this.queueName, this.queueOptions, this.callback );

        assert.calledOnce( this.callback );
        assert( this.queueStub.calledOnce );
    },
    "without callback": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );
        this.messenger.openQueue( this.queueName, this.queueOptions );

        assert.equals( this.callback.callCount, 0 );
        assert( this.queueStub.calledOnce );
    },
    "throws error if there is no connection": function() {
        var openQueueSpy = this.spy( this.messenger, "openQueue" );
        this.stub( this.messenger, "getConnection" ).returns( null );

        try {
            this.messenger.openQueue( this.queueName, this.queueOptions, this.callback );
        } catch ( error ) {}

        assert( openQueueSpy.threw() );
    },
    "adds listener for close event": function() {
        var queueOnSpy = this.spy( this.queue, "on" );
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        this.messenger.openQueue( this.queueName, this.queueOptions, this.callback );

        assert( queueOnSpy.calledWith( "close" ) );
    },
    "adds listener for error event": function() {
        var queueOnSpy = this.spy( this.queue, "on" );
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        this.messenger.openQueue( this.queueName, this.queueOptions, this.callback );

        assert( queueOnSpy.calledWith( "error" ) );
    }
});

buster.testCase( "Test bind queue to exchange", {
    setUp: function() {
        this.bindingKey = "my.#";
        this.queueName = "myqueue";
        this.exchangeName = "myexchange";

        this.messenger = new Messenger.Messenger();
        this.queue = { bind: function() {} };
        this.queues = [];
        this.queues[ this.queueName ] = this.queue;
        this.connection = { queues: this.queues };
    },
    "successfully": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        var queueBindStub = this.stub( this.queue, "bind" ).withArgs( this.exchangeName, this.bindingKey );
        this.queue.bind = queueBindStub;

        this.messenger.bindQueueToExchange( this.bindingKey, this.queueName, this.exchangeName );

        assert( queueBindStub.calledOnce );
    },
    "throws error if there is no connection": function() {
        var bindQueueToExchangeSpy = this.spy( this.messenger, "bindQueueToExchange" );
        this.stub( this.messenger, "getConnection" ).returns( null );

        try {
            this.messenger.bindQueueToExchange( this.bindingKey, this.queueName, this.exchangeName );
        } catch ( error ) {}

        assert( bindQueueToExchangeSpy.threw() );
    }
});

buster.testCase( "Test publish message", {
    setUp: function() {
        this.exchangeName = "myexchange";
        this.routingKey = "my.data";
        this.message = { body: "hello world" };
        this.messageOptions = { immediate: true };

        this.messenger = new Messenger.Messenger();
        this.exchange = { publish: function() {} };
        this.exchanges = [];
        this.exchanges[ this.exchangeName ] = this.exchange;
        this.connection = { exchanges: this.exchanges };
    },
    "successfully": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        var publishStub = this.stub( this.exchange, "publish" ).withArgs( this.routingKey, this.message, this.messageOptions );
        this.exchange.publish = publishStub;

        this.messenger.publish( this.exchangeName, this.routingKey, this.message, this.messageOptions );
        assert( publishStub.calledOnce );
    },
    "throws error if there is no connection": function() {
        var publishSpy = this.spy( this.messenger, "publish" );
        this.stub( this.messenger, "getConnection" ).returns( null );

        try {
            this.messenger.publish( this.exchangeName, this.routingKey, this.message, this.messageOptions );
        } catch ( error ) {}

        assert( publishSpy.threw() );
    },
    "with no exchange": function() {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        var publishStub = this.stub( this.exchange, "publish" ).withArgs( this.routingKey, this.message, this.messageOptions );
        this.exchange.publish = publishStub;

        this.messenger.publish( "dummyExchange", this.routingKey, this.message, this.messageOptions );

        assert.equals( publishStub.callCount, 0 );
    }
});

buster.testCase( "Test subscribe", {
    setUp: function() {
        this.queueName = "myqueue";
        this.subscribeOptions = {};
        this.messageHandler = {};

        this.messenger = new Messenger.Messenger();
        this.queue = { subscribe: function() {} };
        this.queues = [];
        this.queues[ this.queueName ] = this.queue;
        this.connection = { queues: this.queues };
    },
    "successfully": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        var subscribeStub = this.stub( this.queue, "subscribe" ).withArgs( this.subscribeOptions, this.messageHandler );
        this.queue.subscribe = subscribeStub;

        this.messenger.subscribe( this.queueName, this.subscribeOptions, this.messageHandler );
        assert( subscribeStub.calledOnce );
    },
    "throws error if there is no connection": function() {
        var subscribeSpy = this.spy( this.messenger, "subscribe" );
        this.stub( this.messenger, "getConnection" ).returns( null );

        try {
            this.messenger.subscribe( this.queueName, this.subscribeOptions, this.messageHandler );
        } catch ( error ) {}

        assert( subscribeSpy.threw() );
    },
    "with no queue": function() {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        var subscribeStub = this.stub( this.queue, "subscribe" ).withArgs( this.subscribeOptions, this.messageHandler );
        this.queue.subscribe = subscribeStub;

        this.messenger.subscribe( "dummyQueue", this.subscribeOptions, this.messageHandler );

        assert.equals( subscribeStub.callCount, 0 );
    }
});

buster.testCase( "Test get connection", {
    setUp: function() {
        this.connection = new EventEmitter;

        this.url = "amqp://myrabbit.mq";

        this.messenger = new Messenger.Messenger( this.url );
    },
    "successfully": function () {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );
        this.messenger.openConnection();
        this.connection.emit( "ready" );

        assert.same( this.connection, this.messenger.getConnection() );
    }
});

buster.testCase( "Test get named exchange", {
    setUp: function() {
        this.exchangeName = "myexchange";
        this.messenger = new Messenger.Messenger();
        this.exchange = {};
        this.exchanges = [];
        this.exchanges[ this.exchangeName ] = this.exchange;
        this.connection = { exchanges: this.exchanges };
    },
    "successfully": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );

        assert.same( this.exchange, this.messenger.getNamedExchange( this.exchangeName ) );
    },
    "throws error if there is no connection": function() {
        var getNamedExchangeSpy = this.spy( this.messenger, "getNamedExchange" );
        this.stub( this.messenger, "getConnection" ).returns( null );

        try {
            this.messenger.getNamedExchange( this.exchangeName );
        } catch ( error ) {}

        assert( getNamedExchangeSpy.threw() );
    }
});

buster.testCase( "Test get named queue", {
    setUp: function() {
        this.queueName = "myqueue";
        this.messenger = new Messenger.Messenger();
        this.queue = { subscribe: function() {} };
        this.queues = [];
        this.queues[ this.queueName ] = this.queue;
        this.connection = { queues: this.queues };
    },
    "successfully": function () {
        this.stub( this.messenger, "getConnection" ).returns( this.connection );
        
        assert.same( this.queue, this.messenger.getNamedQueue( this.queueName ) );
    },
    "throws error if there is no connection": function() {
        var getNamedQueueSpy = this.spy( this.messenger, "getNamedQueue" );
        this.stub( this.messenger, "getConnection" ).returns( null );

        try {
            this.messenger.getNamedQueue( this.queueName );
        } catch ( error ) {}

        assert( getNamedQueueSpy.threw() );
    }
});

buster.testCase( "Test open and subscribe", {
    setUp: function() {
        this.messenger = new Messenger.Messenger();
        this.exchangeName = "myexchange";
        this.exchangeOptions = { type: "topic" };
        this.queueName = "myqueue";
        this.queueOptions = { autoDelete: true };
        this.bindingKey = "my.#";
        this.subscribeOptions = {};
        this.messageHandler = {};
    },
    "successfully": function () {
        var openExchangeStub = this.stub( this.messenger, "openExchange" ).withArgs( this.exchangeName, this.exchangeOptions ).yields();
        var openQueueStub = this.stub( this.messenger, "openQueue" ).withArgs( this.queueName, this.queueOptions ).yields();
        var bindQueueToExchangeStub = this.stub( this.messenger, "bindQueueToExchange" ).withArgs( this.bindingKey, this.queueName, this.exchangeName );
        var subscribeStub = this.stub( this.messenger, "subscribe" ).withArgs( this.queueName, this.subscribeOptions, this.messageHandler );
        
        this.messenger.openAndSubscribe( this.exchangeName, this.exchangeOptions, this.queueName, this.queueOptions, this.bindingKey, this.subscribeOptions, this.messageHandler );
        
        assert.callOrder( openExchangeStub, openQueueStub, bindQueueToExchangeStub, subscribeStub );
    }
});

buster.testCase( "Test open for publish", {
    setUp: function() {
        this.messenger = new Messenger.Messenger();
        this.exchangeName = "myexchange";
        this.exchangeOptions = { type: "topic" };

        this.callback = this.spy();
    },
    "successfully": function () {
        var openExchangeStub = this.stub( this.messenger, "openExchange" ).withArgs( this.exchangeName, this.exchangeOptions ).yields();
        
        this.messenger.openForPublish( this.exchangeName, this.exchangeOptions, this.callback );
        
        assert.calledOnce( this.callback );
        assert.callOrder( openExchangeStub );
    },
    "without callback": function() {
        var openExchangeStub = this.stub( this.messenger, "openExchange" ).withArgs( this.exchangeName, this.exchangeOptions ).yields();
        
        this.messenger.openForPublish( this.exchangeName, this.exchangeOptions );
        
        assert.equals( this.callback.callCount, 0 );
        assert.callOrder( openExchangeStub );
    }
});