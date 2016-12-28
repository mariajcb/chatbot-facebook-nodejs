'use strict';

const apiai = require('apiai');
const express = require('express');
const crypto = require('crypto'); //verifies request signature
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const uuid = require('uuid');

const config = require('./config');
const webhook = require('./routes/webhook');
const index = require('./routes/index');

// Messenger API parameters
if (!config.FB_PAGE_TOKEN) {
    throw new Error('missing FB_PAGE_TOKEN');
}
if (!config.FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
}
if (!config.API_AI_CLIENT_ACCESS_TOKEN) {
    throw new Error('missing API_AI_CLIENT_ACCESS_TOKEN');
}
if (!config.FB_APP_SECRET) {
    throw new Error('missing FB_APP_SECRET');
}
if (!config.SERVER_URL) { //used for ink to static files
    throw new Error('missing SERVER_URL');
}
if (!config.SENDGRID_API_KEY) { //sending email
	throw new Error('missing SENDGRID_API_KEY');
}
if (!config.EMAIL_FROM) { //sending email
	throw new Error('missing EMAIL_FROM');
}
if (!config.EMAIL_TO) { //sending email
	throw new Error('missing EMAIL_TO');
}


app.set('port', (process.env.PORT || 5000))

//verify request came from facebook
app.use(bodyParser.json({
    verify: verifyRequestSignature
}));

//serve static files in the public directory
app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// Process application/json
app.use(bodyParser.json())

console.log("HELLO APP IS FIRING");

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
    language: "en",
    requestSource: "fb"
});
const sessionIds = new Map();


// //SEND MESSAGE
// function handleMessage(message, sender) {
//     switch (message.type) {
//         case 0: //text
//             sendTextMessage(sender, message.speech);
//             break;
//         case 2: //quick replies
//             let replies = [];
//             for (var i = 0; i < message.replies.length; i++) {
//                 let reply = {
//                     "content_type": "text",
//                     "title": message.replies[i],
//                     "payload": message.replies[i]
//                 }
//                 replies.push(reply);
//             }
//             sendQuickReply(sender, message.title, replies);
//             break;
//         case 3: //image
//             sendImageMessage(sender, message.imageUrl);
//             break;
//         case 4:
//             // custom payload
//             var messageData = {
//                 recipient: {
//                     id: sender
//                 },
//                 message: message.payload.facebook
//
//             };
//
//             callSendAPI(messageData);
//
//             break;
//     }
// }
//
//
// function handleCardMessages(messages, sender) {
//     let elements = [];
//     for (var m = 0; m < messages.length; m++) {
//         let message = messages[m];
//         let buttons = [];
//         for (var b = 0; b < message.buttons.length; b++) {
//             let isLink = (message.buttons[b].postback.substring(0, 4) === 'http');
//             let button;
//             if (isLink) {
//                 button = {
//                     "type": "web_url",
//                     "title": message.buttons[b].text,
//                     "url": message.buttons[b].postback
//                 }
//             } else {
//                 button = {
//                     "type": "postback",
//                     "title": message.buttons[b].text,
//                     "payload": message.buttons[b].postback
//                 }
//             }
//             buttons.push(button);
//         }
//
//         let element = {
//             "title": message.title,
//             "image_url": message.imageUrl,
//             "subtitle": message.subtitle,
//             "buttons": buttons
//         };
//         elements.push(element);
//     }
//     sendGenericMessage(sender, elements);
// }
//
// function sendTextMessage(recipientId, text) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             text: text
//         }
//     }
//     callSendAPI(messageData);
// }
//
// /*
//  * Send an image using the Send API.
//  *
//  */
// function sendImageMessage(recipientId, imageUrl) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "image",
//                 payload: {
//                     url: imageUrl
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Send a Gif using the Send API.
//  *
//  */
// function sendGifMessage(recipientId) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "image",
//                 payload: {
//                     url: config.SERVER_URL + "/assets/instagram_logo.gif"
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Send audio using the Send API.
//  *
//  */
// function sendAudioMessage(recipientId) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "audio",
//                 payload: {
//                     url: config.SERVER_URL + "/assets/sample.mp3"
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Send a video using the Send API.
//  * example videoName: "/assets/allofus480.mov"
//  */
// function sendVideoMessage(recipientId, videoName) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "video",
//                 payload: {
//                     url: config.SERVER_URL + videoName
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Send a video using the Send API.
//  * example fileName: fileName"/assets/test.txt"
//  */
// function sendFileMessage(recipientId, fileName) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "file",
//                 payload: {
//                     url: config.SERVER_URL + fileName
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
//
// /*
//  * Send a button message using the Send API.
//  *
//  */
// function sendButtonMessage(recipientId, text, buttons) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "template",
//                 payload: {
//                     template_type: "button",
//                     text: text,
//                     buttons: buttons
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
//
// function sendGenericMessage(recipientId, elements) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "template",
//                 payload: {
//                     template_type: "generic",
//                     elements: elements
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
// function sendReceiptMessage(recipientId, recipient_name, currency, payment_method,
//     timestamp, elements, address, summary, adjustments) {
//     // Generate a random receipt ID as the API requires a unique ID
//     var receiptId = "order" + Math.floor(Math.random() * 1000);
//
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             attachment: {
//                 type: "template",
//                 payload: {
//                     template_type: "receipt",
//                     recipient_name: recipient_name,
//                     order_number: receiptId,
//                     currency: currency,
//                     payment_method: payment_method,
//                     timestamp: timestamp,
//                     elements: elements,
//                     address: address,
//                     summary: summary,
//                     adjustments: adjustments
//                 }
//             }
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Send a message with Quick Reply buttons.
//  *
//  */
// function sendQuickReply(recipientId, text, replies, metadata) {
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         message: {
//             text: text,
//             metadata: isDefined(metadata) ? metadata : '',
//             quick_replies: replies
//         }
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Send a read receipt to indicate the message has been read
//  *
//  */
// function sendReadReceipt(recipientId) {
//
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         sender_action: "mark_seen"
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Turn typing indicator on
//  *
//  */
// function sendTypingOn(recipientId) {
//
//
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         sender_action: "typing_on"
//     };
//
//     callSendAPI(messageData);
// }
//
// /*
//  * Turn typing indicator off
//  *
//  */
// function sendTypingOff(recipientId) {
//
//     var messageData = {
//         recipient: {
//             id: recipientId
//         },
//         sender_action: "typing_off"
//     };
//
//     callSendAPI(messageData);
// }
//
// //SENDMESSAGE
//
// function greetUserText(userId) {
//     //first read user firstname
//     request({
//         uri: 'https://graph.facebook.com/v2.7/' + userId,
//         qs: {
//             access_token: config.FB_PAGE_TOKEN
//         }
//
//     }, function(error, response, body) {
//         if (!error && response.statusCode == 200) {
//
//             var user = JSON.parse(body);
//
//             if (user.first_name) {
//                 console.log("FB user: %s %s, %s",
//                     user.first_name, user.last_name, user.gender);
//
//                 sendTextMessage(userId, "Welcome " + user.first_name + '!');
//             } else {
//                 console.log("Cannot get data for fb user with id",
//                     userId);
//             }
//         } else {
//             console.error(response.error);
//         }
//
//     });
// }
//

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
	var signature = req.headers["x-hub-signature"];

	if (!signature) {
		throw new Error('Couldn\'t validate the signature.');
	} else {
		var elements = signature.split('=');
		var method = elements[0];
		var signatureHash = elements[1];

		var expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
			.update(buf)
			.digest('hex');

		if (signatureHash != expectedHash) {
			throw new Error("Couldn't validate the request signature.");
		}
	}
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
