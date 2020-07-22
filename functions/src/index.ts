import * as functions from 'firebase-functions';
import { Command, ResponseStatus } from './enum';
import { ValidationService } from './service/validation.service';
import { toResponse } from './exception';
import { CategoryService } from './service/category.service';
import { BlockKitBuilder } from './service/builder.block-kit';
import { SigningInfo } from './model/model.category';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


const validationService = new ValidationService();
const categoryService = new CategoryService();
const templateService = new BlockKitBuilder();


export const eventWebhook = functions.https.onRequest((request, response) => {
    functions.logger.info("Event subscription!", { structuredData: true });
    const { challenge } = request.body;
    functions.logger.info("challenge", challenge);
    response.send({ challenge });
});

export const interactivityWebhook = functions.https.onRequest((request, response) => {

});

export const templateWebhook = functions.https.onRequest((request, response) => {
    const { command, text } = request.body;

    const result = validateCommand(command, Command.TEMPLATE);
    if (result) {
        response.status(ResponseStatus.BAD_REQUEST).send(result);
        return;
    }

    try {
        validateRequest(request);
    } catch (exception) {
        functions.logger.error(exception);
        const { status, ...errorResponse } = toResponse(exception);
        response.status(status).send(errorResponse)
        return;
    }

    if (text) {
        functions.logger.info(`template was entered with the text "${text}"`);
    }
});

const validateCommand = (requestCommand: string, command: Command): any | undefined => {
    let result;
    if (requestCommand !== command) {
        result = {
            "response_type": "in_channel",
            "text": `unknown command ${command}`,
        }
    }
    return result;
}

const validateRequest = request => {
    const {
        'x-slack-request-timestamp': timestamp,
        'x-slack-signature': signature,
    } = request.headers;

    const { body } = request;
    const signingInfo = new SigningInfo(timestamp, body, signature);
    validationService.validateRequest(functions.config().slack.signing.secret, signingInfo);
}


export const categoryCommand = functions.https.onRequest((request, response) => {
    const { command, text } = request.body;
    const result = validateCommand(command, Command.CATEGORY);

    if (result) {
        response.status(ResponseStatus.BAD_REQUEST).send(result);
        return;
    }
    try {
        validateRequest(request);
    } catch (exception) {
        functions.logger.error(exception);
        const { status, ...errorResponse } = toResponse(exception);
        response.status(status).send(errorResponse)
        return;
    }

    if (text) {
        functions.logger.info(`category was entered with the text "${text}"`);
    }

    categoryService.listCategories().subscribe(data => {
        const categoryBlock = templateService.createCategoryBlock(data);
        functions.logger.info("response", categoryBlock);
        response.send(categoryBlock);
    });
});
