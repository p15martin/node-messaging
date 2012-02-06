var messaging = require( "../../lib/library" );

var url = "amqp://pbizchjy:LwmnGi9zQN1pX2yU@ydsxtmvm.heroku.srs.rabbitmq.com:23569/ydsxtmvm";
var exchangeName = "myexchange";
var exchangeOptions = { type: "topic" };
var routingKey = "my.data";
var messageOptions = { immediate: true };

messaging.createMessenger( url, function( messenger ) {
	openForPublish( messenger );
});

function openForPublish( messenger ) {
	messenger.openForPublish( exchangeName, exchangeOptions, function() {
		var count = 0;

		setInterval( function () {
			console.log( "Sending message '%d'", count );
			messenger.publish( exchangeName, routingKey, { body: "hello world #" + count++ }, messageOptions );	
		}, 200);
	});
}