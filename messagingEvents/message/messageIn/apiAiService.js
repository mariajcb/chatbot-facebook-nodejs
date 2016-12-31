const config = require('../../../config.js')
const apiai = require('apiai')

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en",
	requestSource: "fb"
});

module.exports = apiAiService;
