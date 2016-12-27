function handleMessageAttachments(messageAttachments, senderID) {
    //for now just reply
    sendTextMessage(senderID, "Attachment received. Thank you.");
}

module.exports = handleMessageAttachments;
