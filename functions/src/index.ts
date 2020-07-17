import * as functions from 'firebase-functions';
import { Command, ErrorCode, ResponseStatus } from './enum';
import { ValidationService } from './service/validation.service';
import { Error } from './exception';
import { CategoryService } from './service/category.service';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


const validationService = new ValidationService();
const categoryService = new CategoryService();


export const eventSubscription = functions.https.onRequest((request, response) => {
    functions.logger.info("Event subscription!", { structuredData: true });
    const { challenge } = request.body;
    functions.logger.info("challenge", challenge);
    response.send({ challenge });
});



export const templateCommand = functions.https.onRequest((request, response) => {
    const { command } = request.body;

    if (command !== Command.TEMPLATE) {
        response.send();
        return;
    }
})

function processException(error: Error) {
    let response = {
        "response_type": "in_channel",
        "text": "Something unexpected occured",
        "status": ResponseStatus.INTERNAL_SERVER_ERROR
    };

    if (error.code === ErrorCode.TIMEOUT) {
        response = {
            "response_type": "in_channel",
            "text": "Unable to process command. try again!",
            "status": ResponseStatus.BAD_REQUEST
        };
    } else if (error.code === ErrorCode.UNAUTHORIZED) {
        response = {
            "response_type": "in_channel",
            "text": "Unauthorized request",
            "status": ResponseStatus.UNAUTHORIZED
        };
    }
    return response
}


export const categoryCommand = functions.https.onRequest((request, response) => {
    functions.logger.info("request body", request.body);
    const { command } = request.body;
    if (command !== Command.CATEGORY) {
        functions.logger.info("invalid command: ", command);
        response.send();
        return;
    }
    try {
        validationService.validateRequest(functions.config().slack.signing.secret, request);
        functions.logger.info("after validation of request");
    } catch (exception) {
        functions.logger.error(exception);
        if (exception instanceof Error) {
            const errorResponse = processException(exception);
            const status = errorResponse.status;
            delete errorResponse.status;
            response.status(status).send(errorResponse);
        } else {
            response.status(ResponseStatus.INTERNAL_SERVER_ERROR).send(exception);
        }
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
