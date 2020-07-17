import * as functions from 'firebase-functions';
import { Command, ErrorCode } from './enum';
import { ValidationService } from './service/validation.service';
import { Error } from './exception';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


const validationService = new ValidationService();
export const eventSubscription = functions.https.onRequest((request, response) => {
    functions.logger.info("Event subscription!", { structuredData: true });
    const { challenge } = request.body;
    functions.logger.info("challenge", challenge);
    response.send({ challenge });
});




export const templateCommand = functions.https.onRequest((request, response) => {
    const { command } = request.params;

    if (command !== Command.TEMPLATE) {
        response.send();
        return;
    }
})

function processException(error: Error) {
    let object;
    if (error.code === ErrorCode.TIMEOUT) {
        object = {
            "response_type": "in_channel",
            "text": "Unable to process command. try again!"
        };
    } else if (error.code === ErrorCode.UNAUTHORIZED) {
        object = {
            "response_type": "in_channel",
            "text": "Unauthorized request"
        };
    }
    return object
}


export const categoryCommand = functions.https.onRequest((request, response) => {
    functions.logger.info("request body", request.body);
    const { command } = request.params;

    if (command !== Command.CATEGORY) {
        functions.logger.info("invalid command: ", command);
        response.send();
        return;
    }
    try {
        validationService.validateRequest(functions.config().slack.signing.secret, request);
    } catch (exception) {
        functions.logger.error(exception.getMessage(), exception);
        const error = processException(exception);
        response.sendStatus(400);
        response.send(error);
        return;
    }


    // const { text } = request.body;
    // if (text !== '') {
    //     functions.logger.info("find category", text, { structuredData: true });
    // }

    // const options =
    //     [{
    //         "text": {
    //             "type": "plain_text",
    //             "text": 'category name',
    //             "emoji": true
    //         },
    //         "value": 'category id'
    //     }];


    // const body = {
    //     blocks: [{
    //         "type": "section",
    //         "text": {
    //             "type": "mrkdwn",
    //             "text": "Pick a category"
    //         },
    //         "accessory": {
    //             "type": "static_select",
    //             "action_id": "select_category_action",
    //             "placeholder": {
    //                 "type": "plain_text",
    //                 "text": "Select a category"
    //             },
    //             "options": options
    //         }
    //     }]
    // }

    const body = {
        "response_type": "in_channel",
        "text": "It's 80 degrees right now."
    }

    functions.logger.info("response", JSON.stringify(body), { structuredData: true });
    response.send(body);
});
