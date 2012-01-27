var buster = require("buster");
var amqp = require( "amqp" );
var EventEmitter = require('events').EventEmitter;
var Messenger = require("../../lib/internal/messenger");

buster.testCase( "Test create messenger", {
    "successfully": function () {
        var messenger = Messenger.createMessenger();

        assert.isObject( messenger );
    }
});

buster.testCase( "Test create connection", {
    setUp: function() {
        this.connection = new EventEmitter;
        this.url = "http://myrabbit.mq";

        this.messenger = Messenger.createMessenger();
        this.callback = this.spy();
        this.error = new Error();
    },
    "successfully": function () {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.createConnection( this.url, this.callback );

        this.connection.emit( "ready" );

        assert.isObject( this.messenger.connection );
        assert.calledOnce( this.callback );
        assert( amqpStub.called );
    },
    "without callback": function () {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.createConnection( this.url );

        this.connection.emit( "ready" );

        assert.isObject( this.messenger.connection );
        assert( amqpStub.called );
    },
    "connection closed": function() {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.createConnection( this.url, this.callback );

        this.connection.emit( "close" );

        assert.calledOnce( this.callback );
        assert( amqpStub.called );
    },
    "with an error": function() {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.createConnection( this.url, this.callback );

        this.connection.emit( "error", this.error );

        assert.calledOnceWith( this.callback, this.error );
        assert( amqpStub.called );
    },
    "with an error and no callback": function () {
        var amqpStub = this.stub( amqp, "createConnection" ).withArgs( { url: this.url } ).returns( this.connection );

        this.messenger.createConnection( this.url );

        this.connection.emit( "error", this.error );

        assert( amqpStub.called );
    }
});

buster.testCase( "Test create exchange", {
    setUp: function() {
        this.connection = { exchange: function() {} };
        this.exchange = {};

        this.exchangeName = "myexchange";
        this.exchangeOptions = { type: "topic" };

        this.messenger = Messenger.createMessenger();
        this.messenger.connection = this.connection;

        this.callback = this.spy();
    },
    "successfully": function () {
        var connectionStub = this.stub( this.connection, "exchange" ).withArgs( this.exchangeName, this.exchangeOptions, this.callback ).returns( this.exchange ).yields( this.exchange );
        this.connection.exchange = connectionStub;

        this.messenger.createExchange( this.exchangeName, this.exchangeOptions, this.callback );

        assert.isObject( this.messenger.exchange );
        assert.calledOnce( this.callback );
        assert( connectionStub.called );
    },
    "without callback": function () {
        var connectionStub = this.stub( this.connection, "exchange" ).withArgs( this.exchangeName, this.exchangeOptions, this.callback ).returns( this.exchange ).yields( this.exchange );
        this.connection.exchange = connectionStub;

        this.messenger.createExchange( this.exchangeName, this.exchangeOptions );

        assert.isObject( this.messenger.exchange );
        assert( connectionStub.called );
    }
    // TODO what if exchange throws an error
});

buster.testCase( "Test create queue", {
    setUp: function() {
        this.connection = { queue: function() {} };
        this.queue = {};

        this.queueName = "myqueue";

        this.messenger = Messenger.createMessenger();
        this.messenger.connection = this.connection;

        this.callback = this.spy();
    },
    "successfully": function () {
        var connectionStub = this.stub( this.connection, "queue" ).withArgs( this.queueName, this.callback ).returns( this.queue ).yields( this.queue );
        this.connection.queue = connectionStub;

        this.messenger.createQueue( this.queueName, this.callback );

        assert.isObject( this.messenger.queue );
        assert.calledOnce( this.callback );
        assert( connectionStub.called );
    },
    "without callback": function () {
        var connectionStub = this.stub( this.connection, "queue" ).withArgs( this.queueName, this.callback ).returns( this.queue ).yields( this.queue );
        this.connection.queue = connectionStub;

        this.messenger.createQueue( this.queueName, this.exchangeOptions );

        assert.isObject( this.messenger.queue );
        assert( connectionStub.called );
    }
    // TODO what if queue throws an error
});

buster.testCase( "Test bind queue to exchange", {
    setUp: function() {
        this.exchangeName = "myexchange";
        this.bindingKey = "my.#";

        this.queue = { bind: function() {} };
        this.exchange = { name: this.exchangeName };

        this.messenger = Messenger.createMessenger();
        this.messenger.queue = this.queue;
        this.messenger.exchange = this.exchange;

        this.callback = this.spy();
    },
    "successfully": function () {
        var queueStub = this.stub( this.queue, "bind" ).withArgs( this.exchangeName, this.bindingKey );
        this.queue.bind = queueStub;

        this.messenger.bindQueueToExchange( this.bindingKey, this.callback );

        assert.calledOnce( this.callback );
        assert( queueStub.called );
    },
    "without callback": function () {
        var queueStub = this.stub( this.queue, "bind" ).withArgs( this.exchangeName, this.bindingKey );
        this.queue.bind = queueStub;

        this.messenger.bindQueueToExchange( this.bindingKey );

        assert( queueStub.called );
    }
    // TODO what if queue throws an error
});

buster.testCase( "Test publish", {
    setUp: function() {
        this.routingKey = "my.data";
        this.message = { body: "hello world" };

        this.exchange = { publish: function() {} };

        this.messenger = Messenger.createMessenger();
        this.messenger.exchange = this.exchange;
    },
    "successfully": function () {
        var exchangeStub = this.stub( this.exchange, "publish" ).withArgs( this.routingKey, this.message );
        this.exchange.publish = exchangeStub;

        this.messenger.publish( this.routingKey, this.message );

        assert( exchangeStub.called );
    }
});

buster.testCase( "Test subscribe", {
    setUp: function() {
        this.queue = { subscribe: function() {} };
        this.messageHandler = {};

        this.messenger = Messenger.createMessenger();
        this.messenger.queue = this.queue;
    },
    "successfully": function () {
        var queueStub = this.stub( this.queue, "subscribe" ).withArgs( this.messageHandler );
        this.queue.subscribe = queueStub;

        this.messenger.subscribe( this.messageHandler );

        assert( queueStub.called );
    }
});