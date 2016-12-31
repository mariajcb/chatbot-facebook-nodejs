const handleEcho = require('./messageIn/echo')
const handleQuickReply = require('./messageIn/quickReply')
const handleMessageAttachments = require('./messageIn/messageAttachments')
const sendToApiAi = require('./messageIn/sendToApiAi')
const apiAiService = require('./messageIn/apiAiService')
const handleApiAiResponse = require('./messageOut/apiAiResponse')
const handleApiAiAction = require('./messageOut/apiAiAction')
const callSendAPI = require('./messageOut/callSendAPI')
const sendEmail = require('./messageOut/sendEmail')
const sendMessage = require('./messageOut/sendMessage')

const apiai = require('apiai');
const config = require('../../config.js');
const request = require('request');
const uuid = require('uuid');


//received message from user
function receivedMessage(event) {
  console.log('RECEIVED MESSAGE IS FIRING');
	console.log('THIS IS SESSIONS IDS', apiAiService.sessionIds);
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    if (!apiAiService.sessionIds.has(senderID)) {
        apiAiService.sessionIds.set(senderID, uuid.v1());
    }
    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
        handleEcho(messageId, appId, metadata);
        return;
    } else if (quickReply) {
        handleQuickReply(senderID, quickReply, messageId);
        return;
    }


    if (messageText) {
        //send message to api.ai
        sendToApiAi(senderID, messageText);
    } else if (messageAttachments) {
        handleMessageAttachments(messageAttachments, senderID);
    }
}

module.exports = receivedMessage;
