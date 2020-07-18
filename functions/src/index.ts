import * as functions from 'firebase-functions';
import { Command, ErrorCode, ResponseStatus, METHOD } from './enum';
import { ValidationService } from './service/validation.service';
import { Error } from './exception';
import { CategoryService } from './service/category.service';
import { TemplateService } from './service/template.service';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


const validationService = new ValidationService();
const categoryService = new CategoryService();
const templateService = new TemplateService();
const slackRequestTime = 'x-slack-request-timestamp';

export const eventSubscription = functions.https.onRequest((request, response) => {
    functions.logger.info("Event subscription!", { structuredData: true });
    const { challenge } = request.body;
    functions.logger.info("challenge", challenge);
    response.send({ challenge });
});

export const templateCommand = functions.https.onRequest((request, response) => {
    const { command } = request.body;

    if (METHOD.POST !== request.method || command !== Command.TEMPLATE) {
        response.status(400).send({
            "response_type": "in_channel",
            "text": "invalid request",
        });
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
    const { command } = request.body;
    if (command !== Command.CATEGORY) {
        functions.logger.info("invalid command: ", command);
        response.send();
        return;
    }
    try {
        const signingInfo = {
            timestamp: request.headers[slackRequestTime],
            body: request.body
        }
        functions.logger.info("signing information", signingInfo);
        validationService.validateRequest(functions.config().slack.signing.secret, signingInfo);
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

    categoryService.listCategories().subscribe(data => {
        const categoryBlock = templateService.createCategoryBlock(data);
        functions.logger.info("response", categoryBlock);
        response.send(categoryBlock);
    });
});
