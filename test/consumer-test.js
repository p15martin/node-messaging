var buster = require("buster");
var Messenger = require("../lib/internal/messenger");
var Consumer = require("../lib/consumer");

buster.testCase( "Test create consumer", {
    "successfully": function () {
        var consumer = Consumer.createConsumer();

        assert.isObject( consumer );
    }
});

buster.testCase( "Test consumer", {
	setUp: function() {
		this.url = "http://myrabbit.mq";
		this.exchangeName = "myexchange";
		this.exchangeOptions = { type: "topic" };
		this.queueName = "myqueue";
		this.bindingKey = "my.#";
		this.messageHandler = function() {};

		this.messenger = Messenger.createMessenger();
		this.stub( Messenger, "createMessenger" ).returns( this.messenger );

		this.createConnectionStub = this.stub( this.messenger, "createConnection" ).withArgs( this.url ).yields();
        this.createExchangeStub = this.stub( this.messenger, "createExchange" ).withArgs( this.exchangeName, this.exchangeOptions ).yields();
        this.createQueue = this.stub( this.messenger, "createQueue" ).withArgs( this.queueName ).yields();
        this.bindQueueToExchange = this.stub( this.messenger, "bindQueueToExchange" ).withArgs( this.bindingKey ).yields();

		this.consumer = Consumer.createConsumer();
		this.callback = this.spy();
	},
    "connect": function () {
		this.consumer.connect( this.url, this.exchangeName, this.exchangeOptions, this.queueName, this.bindingKey, this.callback );

        assert.callOrder( this.createConnectionStub, this.createExchangeStub, this.createQueue, this.bindQueueToExchange );
        assert.calledOnce( this.callback );
    },
    "connect without callback": function () {
        this.consumer.connect( this.url, this.exchangeName, this.exchangeOptions, this.queueName, this.bindingKey );

        assert.callOrder( this.createConnectionStub, this.createExchangeStub, this.createQueue, this.bindQueueToExchange );
    },
    "receive messages": function () {
    	var messengerMock = this.mock( this.messenger ).expects( "subscribe" ).once().withArgs( this.messageHandler );

    	this.consumer.connect( this.url, this.exchangeName, this.exchangeOptions, this.queueName, this.bindingKey );

        this.consumer.receiveMessages( this.messageHandler );

        assert( messengerMock.verify() );
    }
});