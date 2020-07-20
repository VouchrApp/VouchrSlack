import * as functions from 'firebase-functions';
import { Command, ErrorCode, ResponseStatus, METHOD } from './enum';
import { ValidationService } from './service/validation.service';
import { Error, toResponse } from './exception';
import { CategoryService } from './service/category.service';
import { BlockKitBuilder } from './service/builder.block-kit';
import { SigningInfo } from './model/model.category';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


const validationService = new ValidationService();
const categoryService = new CategoryService();
const templateService = new BlockKitBuilder();
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
        response.status(ResponseStatus.BAD_REQUEST).send({
            "response_type": "in_channel",
            "text": "invalid request",
        });
        return;
    }
});

const processException = (error: Error) => {
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
        const signingInfo = new SigningInfo(request.headers[slackRequestTime], request.body);
        validationService.validateRequest(functions.config().slack.signing.secret, signingInfo);
        functions.logger.info("response", signingInfo);
    } catch (exception) {
        functions.logger.error(exception);
        const errorResponse = toResponse(exception);
        response.status(errorResponse.status).send(errorResponse.message)
        return;
    }

    categoryService.listCategories().subscribe(data => {
        const categoryBlock = templateService.createCategoryBlock(data);
        functions.logger.info("response", categoryBlock);
        response.send(categoryBlock);
    });
});
