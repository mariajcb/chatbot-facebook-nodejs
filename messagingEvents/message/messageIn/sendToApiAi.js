const apiAiService = require('./apiAiService')
const sendMessage = require('../messageOut/sendMessage')
const receivedMessage = require('../receivedMessage')
const callSendAPI = require('../messageOut/callSendAPI')
const config = require('../../../config.js');

const request = require('request');
// const sessionIds = new Map();

function sendToApiAi(sender, text) {

    sendMessage.sendTypingOn(sender);
    let apiaiRequest = apiAiService.textRequest(text, {
        sessionId: sessionIds.get(sender)
    });

    apiaiRequest.on('response', (response) => {
        if (isDefined(response.result)) {
            handleApiAiResponse(sender, response);
        }
    });

    apiaiRequest.on('error', (error) => console.error(error));
    apiaiRequest.end();
}

module.exports = sendToApiAi;
