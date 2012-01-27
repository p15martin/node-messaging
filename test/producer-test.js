var buster = require("buster");
var Messenger = require("../lib/internal/messenger");
var Producer = require("../lib/producer");

buster.testCase( "Test create producer", {
    "successfully": function () {
        var producer = Producer.createProducer();

        assert.isObject( producer );
    }
});

buster.testCase( "Test producer", {
	setUp: function() {
		this.url = "http://myrabbit.mq";
		this.exchangeName = "myexchange";
		this.exchangeOptions = { type: "topic" };
		this.routingKey = "my.data";
		this.message = { body: "hello world" };

		this.messenger = Messenger.createMessenger();
		this.stub( Messenger, "createMessenger" ).returns( this.messenger );

		this.createConnectionStub = this.stub( this.messenger, "createConnection" ).withArgs( this.url ).yields();
        this.createExchangeStub = this.stub( this.messenger, "createExchange" ).withArgs( this.exchangeName, this.exchangeOptions ).yields();

		this.producer = Producer.createProducer();
		this.callback = this.spy();
	},
    "connect": function () {
		this.producer.connect( this.url, this.exchangeName, this.exchangeOptions, this.callback );

        assert.callOrder( this.createConnectionStub, this.createExchangeStub );
        assert.calledOnce( this.callback );
    },
    "connect without callback": function () {
        this.producer.connect( this.url, this.exchangeName, this.exchangeOptions );

        assert.callOrder( this.createConnectionStub, this.createExchangeStub );
    },
    "send messages": function () {
    	var messengerMock = this.mock( this.messenger ).expects( "publish" ).once().withArgs( this.routingKey, this.message );

    	this.producer.connect( this.url, this.exchangeName, this.exchangeOptions );

        this.producer.sendMessage( this.routingKey, this.message );

        assert( messengerMock.verify() );
    }
});