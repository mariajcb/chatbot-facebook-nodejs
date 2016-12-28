//   function handleMessage(message, sender) {
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


// module.exports = {
//   handleMessage,
//   handleCardMessages,
//   sendImageMessage,
//   sendGifMessage,
//   sendAudioMessage,
//   sendVideoMessage,
//   sendFileMessage,
//   sendButtonMessage,
//   sendGenericMessage,
//   sendReceiptMessage,
//   sendQuickReply,
//   sendReadReceipt,
//   sendTypingOn,
//   sendTypingOff
// }
