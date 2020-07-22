import * as functions from 'firebase-functions';
import { Command, ResponseStatus, METHOD } from './enum';
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


export const eventSubscription = functions.https.onRequest((request, response) => {
    functions.logger.info("Event subscription!", { structuredData: true });
    const { challenge } = request.body;
    functions.logger.info("challenge", challenge);
    response.send({ challenge });
});

export const templateCommand = functions.https.onRequest((request, response) => {
    const { command } = request.body;

    if (METHOD.POST !== request.method || command !== Command.TEMPLATE) {
        response.status(ResponseStatus.BAD_REQUEST).send({
            "response_type": "in_channel",
            "text": "invalid request",
        });
        return;
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


export const categoryCommand = functions.https.onRequest((request, response) => {
    const { command } = request.body;
    const result = validateCommand(command, Command.CATEGORY);

    if (result) {
        response.status(ResponseStatus.BAD_REQUEST).send(result);
        return;
    }
    try {
        const {
            'x-slack-request-timestamp': timestamp,
            'x-slack-signature': signature,
        } = request.headers;
        const signingInfo = new SigningInfo(timestamp, request.body, signature);
        validationService.validateRequest(functions.config().slack.signing.secret, signingInfo);
        functions.logger.info("response", signingInfo);
    } catch (exception) {
        functions.logger.error(exception);
        const error = toResponse(exception);
        const { status, ...errorResponse } = error;
        response.status(status).send(errorResponse)
        return;
    }

    categoryService.listCategories().subscribe(data => {
        const categoryBlock = templateService.createCategoryBlock(data);
        functions.logger.info("response", categoryBlock);
        response.send(categoryBlock);
    });
});
