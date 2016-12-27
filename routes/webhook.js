// var express = require('express')
// var router = express.Router()
// var receivedAccountLink = require('../messagingEvents/accountLink')
// var receivedMessage = require('../messagingEvents/message/receivedMessage')
// var receivedDeliveryConfirmation = require('../messagingEvents/deliveryConfirmation')
// var receivedPostback = require('../messagingEvents/postback')
// var receivedMessageRead = require('../messagingEvents/messageRead')
// var receivedAuthentication = require('../messagingEvents/authentication')
//
// // for Facebook verification
// router.get('/webhook/', function(req, res) {
//     console.log("request");
//     if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
//         res.status(200).send(req.query['hub.challenge']);
//     } else {
//         console.error("Failed validation. Make sure the validation tokens match.");
//         res.sendStatus(403);
//     }
// })
//
// /*
//  * All callbacks for Messenger are POST-ed. They will be sent to the same
//  * webhook. Be sure to subscribe your app to your page to receive callbacks
//  * for your page.
//  * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
//  *
//  */
// router.post('/webhook/', function(req, res) {
//     var data = req.body;
//     console.log(JSON.stringify(data));
//
//     // Make sure this is a page subscription
//     if (data.object == 'page') {
//         // Iterate over each entry
//         // There may be multiple if batched
//         data.entry.forEach(function(pageEntry) {
//             var pageID = pageEntry.id;
//             var timeOfEvent = pageEntry.time;
//
//             // Iterate over each messaging event
//             pageEntry.messaging.forEach(function(messagingEvent) {
//                 if (messagingEvent.optin) {
//                     receivedAuthentication(messagingEvent);
//                 } else if (messagingEvent.message) {
//                     receivedMessage(messagingEvent);
//                 } else if (messagingEvent.delivery) {
//                     receivedDeliveryConfirmation(messagingEvent);
//                 } else if (messagingEvent.postback) {
//                     receivedPostback(messagingEvent);
//                 } else if (messagingEvent.read) {
//                     receivedMessageRead(messagingEvent);
//                 } else if (messagingEvent.account_linking) {
//                     receivedAccountLink(messagingEvent);
//                 } else {
//                     console.log("Webhook received unknown messagingEvent: ", messagingEvent);
//                 }
//             });
//         });
//
//         // Assume all went well.
//         // You must send back a 200, within 20 seconds
//         res.sendStatus(200);
//     }
// });
//
// /*
//  * Authorization Event
//  *
//  * The value for 'optin.ref' is defined in the entry point. For the "Send to
//  * Messenger" plugin, it is the 'data-ref' field. Read more at
//  * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
//  *
//  */
// function receivedAuthentication(event) {
// 	var senderID = event.sender.id;
// 	var recipientID = event.recipient.id;
// 	var timeOfAuth = event.timestamp;
//
// 	// The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
// 	// The developer can set this to an arbitrary value to associate the
// 	// authentication callback with the 'Send to Messenger' click event. This is
// 	// a way to do account linking when the user clicks the 'Send to Messenger'
// 	// plugin.
// 	var passThroughParam = event.optin.ref;
//
// 	console.log("Received authentication for user %d and page %d with pass " +
// 		"through param '%s' at %d", senderID, recipientID, passThroughParam,
// 		timeOfAuth);
//
// 	// When an authentication is received, we'll send a message back to the sender
// 	// to let them know it was successful.
// 	sendTextMessage(senderID, "Authentication successful");
// }
//
// module.exports = router
