console.log('HANDLE API ACTION IS FIRING');

function handleApiAiAction(sender, action, responseText, contexts, parameters) {
    switch (action) {
        case "detailed-application":
            if (isDefined(contexts[0]) && contexts[0].name == 'job_application' && contexts[0].parameters) {
              console.log("HELLO");
                let phone_number = (isDefined(contexts[0].parameters['phone-number']) &&
                    contexts[0].parameters['phone-number'] != '') ? contexts[0].parameters['phone-number'] : '';

                let user_name = (isDefined(contexts[0].parameters['user-name']) &&
                    contexts[0].parameters['user-name'] != '') ? contexts[0].parameters['user-name'] : '';

                let current_job = (isDefined(contexts[0].parameters['current-job']) &&
                    contexts[0].parameters['current-job'] != '') ? contexts[0].parameters['current-job'] : '';

                let years_of_experience = (isDefined(contexts[0].parameters['years-of-experience']) &&
                    contexts[0].parameters['years-of-experience'] != '') ? contexts[0].parameters['years-of-experience'] : '';

                let job_vacancy = (isDefined(contexts[0].parameters['job-vacancy']) &&
                    contexts[0].parameters['job-vacancy'] != '') ? contexts[0].parameters['job-vacancy'] : '';

                if (phone_number != '' && user_name != '' && previous_job != '' && years_of_experience != '' &&
                    job_vacancy != '') {
                    let emailContent = 'A new job inquiry from ' + user_name + ' for the job: ' + job_vacancy +
                        '.<br> Current job position: ' + current_job + '.' +
                        '.<br> Years of experience: ' + years_of_experience + '.' +
                        '.<br> Phone number: ' + phone_number + '.';

                    sendEmail('New job application', emailContent);
                }
            }
            sendTextMessage(sender, responseText)

        case "job-inquiry":
            let replies = [{
                "content_type": "text",
                "title": "Accountant",
                "payload": "Accountant"
            }, {
                "content_type": "text",
                "title": "Sales",
                "payload": "Sales"
            }, {
                "content_type": "text",
                "title": "Not interested",
                "payload": "Not interested"
            }];
            sendQuickReply(sender, responseText, replies);
            break;
        default:
            //unhandled action, just send back the text
            sendTextMessage(sender, responseText);
    }
}

module.exports = handleApiAiAction;