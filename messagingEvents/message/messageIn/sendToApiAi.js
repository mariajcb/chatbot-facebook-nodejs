const apiAiService = require('./apiAiService')
const isDefined = require('./isDefined')
const sendMessage = require('../messageOut/sendMessage')
const receivedMessage = require('../receivedMessage')
const handleApiAiResponse = require('../messageOut/apiAiResponse')
const callSendAPI = require('../messageOut/callSendAPI')

const config = require('../../../config.js');

const request = require('request');

function sendToApiAi(sender, text) {

    sendMessage.sendTypingOn(sender);
    let apiaiRequest = apiAiService.apiAiService.textRequest(text, {
        sessionId: apiAiService.sessionIds.get(sender)
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
