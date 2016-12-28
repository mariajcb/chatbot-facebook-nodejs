'use strict';

const apiai = require('apiai');
const express = require('express');
const crypto = require('crypto'); //verifies request signature
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const config = require('./config');
// const webhook = require('./routes/webhook');
const index = require('./routes/index');

var receivedAccountLink = require('./messagingEvents/accountLink')
var receivedMessage = require('./messagingEvents/message/receivedMessage')
var receivedDeliveryConfirmation = require('./messagingEvents/deliveryConfirmation')
var receivedPostback = require('./messagingEvents/postback')
var receivedMessageRead = require('./messagingEvents/messageRead')
var receivedAuthentication = require('./messagingEvents/authentication')

// app.use('/', webhook)

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

app.get('/test', function(req, res) {
    console.log("made it to test route");
    res.status(200).send("made it to test route and I feel good");
})

// for Facebook verification
app.get('/webhook/', function(req, res) {
    console.log("request");
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
})

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook/', function(req, res) {
    var data = req.body;
    console.log(JSON.stringify(data));

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.optin) {
                    receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        // You must send back a 200, within 20 seconds
        res.sendStatus(200);
    }
});

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
    language: "en",
    requestSource: "fb"
});

// const sessionIds = new Map();

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

//SEND MESSAGE//
function handleMessage(message, sender) {
  switch (message.type) {
      case 0: //text
          sendTextMessage(sender, message.speech);
          break;
      case 2: //quick replies
          let replies = [];
          for (var i = 0; i < message.replies.length; i++) {
              let reply = {
                  "content_type": "text",
                  "title": message.replies[i],
                  "payload": message.replies[i]
              }
              replies.push(reply);
          }
          sendQuickReply(sender, message.title, replies);
          break;
      case 3: //image
          sendImageMessage(sender, message.imageUrl);
          break;
      case 4:
          // custom payload
          var messageData = {
              recipient: {
                  id: sender
              },
              message: message.payload.facebook

          };

          callSendAPI(messageData);

          break;
  }
}


function handleCardMessages(messages, sender) {
  let elements = [];
  for (var m = 0; m < messages.length; m++) {
      let message = messages[m];
      let buttons = [];
      for (var b = 0; b < message.buttons.length; b++) {
          let isLink = (message.buttons[b].postback.substring(0, 4) === 'http');
          let button;
          if (isLink) {
              button = {
                  "type": "web_url",
                  "title": message.buttons[b].text,
                  "url": message.buttons[b].postback
              }
          } else {
              button = {
                  "type": "postback",
                  "title": message.buttons[b].text,
                  "payload": message.buttons[b].postback
              }
          }
          buttons.push(button);
      }

      let element = {
          "title": message.title,
          "image_url": message.imageUrl,
          "subtitle": message.subtitle,
          "buttons": buttons
      };
      elements.push(element);
  }
  sendGenericMessage(sender, elements);
}

function sendTextMessage(recipientId, text) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          text: text
      }
  }
  callSendAPI(messageData);
}

/*
* Send an image using the Send API.
*
*/
function sendImageMessage(recipientId, imageUrl) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "image",
              payload: {
                  url: imageUrl
              }
          }
      }
  };

  callSendAPI(messageData);
}

/*
* Send a Gif using the Send API.
*
*/
function sendGifMessage(recipientId) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "image",
              payload: {
                  url: config.SERVER_URL + "/assets/instagram_logo.gif"
              }
          }
      }
  };

  callSendAPI(messageData);
}

/*
* Send audio using the Send API.
*
*/
function sendAudioMessage(recipientId) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "audio",
              payload: {
                  url: config.SERVER_URL + "/assets/sample.mp3"
              }
          }
      }
  };

  callSendAPI(messageData);
}

/*
* Send a video using the Send API.
* example videoName: "/assets/allofus480.mov"
*/
function sendVideoMessage(recipientId, videoName) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "video",
              payload: {
                  url: config.SERVER_URL + videoName
              }
          }
      }
  };

  callSendAPI(messageData);
}

/*
* Send a video using the Send API.
* example fileName: fileName"/assets/test.txt"
*/
function sendFileMessage(recipientId, fileName) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "file",
              payload: {
                  url: config.SERVER_URL + fileName
              }
          }
      }
  };

  callSendAPI(messageData);
}



/*
* Send a button message using the Send API.
*
*/
function sendButtonMessage(recipientId, text, buttons) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "template",
              payload: {
                  template_type: "button",
                  text: text,
                  buttons: buttons
              }
          }
      }
  };

  callSendAPI(messageData);
}


function sendGenericMessage(recipientId, elements) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "template",
              payload: {
                  template_type: "generic",
                  elements: elements
              }
          }
      }
  };

  callSendAPI(messageData);
}

function sendReceiptMessage(recipientId, recipient_name, currency, payment_method,
  timestamp, elements, address, summary, adjustments) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random() * 1000);

  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          attachment: {
              type: "template",
              payload: {
                  template_type: "receipt",
                  recipient_name: recipient_name,
                  order_number: receiptId,
                  currency: currency,
                  payment_method: payment_method,
                  timestamp: timestamp,
                  elements: elements,
                  address: address,
                  summary: summary,
                  adjustments: adjustments
              }
          }
      }
  };

  callSendAPI(messageData);
}

/*
* Send a message with Quick Reply buttons.
*
*/
function sendQuickReply(recipientId, text, replies, metadata) {
  var messageData = {
      recipient: {
          id: recipientId
      },
      message: {
          text: text,
          metadata: isDefined(metadata) ? metadata : '',
          quick_replies: replies
      }
  };

  callSendAPI(messageData);
}

/*
* Send a read receipt to indicate the message has been read
*
*/
function sendReadReceipt(recipientId) {

  var messageData = {
      recipient: {
          id: recipientId
      },
      sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
* Turn typing indicator on
*
*/
function sendTypingOn(recipientId) {


  var messageData = {
      recipient: {
          id: recipientId
      },
      sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
* Turn typing indicator off
*
*/
function sendTypingOff(recipientId) {

  var messageData = {
      recipient: {
          id: recipientId
      },
      sender_action: "typing_off"
  };

  callSendAPI(messageData);
}
//

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
