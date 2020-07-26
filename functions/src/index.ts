import * as functions from "firebase-functions";
import { Command } from "./enum";
import { ValidationService } from "./service/validation.service";
import { toResponse, IllegalArgumentException } from "./exception";
import { CategoryService } from "./service/category.service";
import { BlockKitBuilder } from "./service/builder.block-kit";
import { SigningInfo } from "./model/model.category";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

const validationService = new ValidationService();
const categoryService = new CategoryService();
const templateService = new BlockKitBuilder();

export const getEvent = functions.https.onRequest((request, response) => {
  functions.logger.info("Event subscription!", { structuredData: true });
  const { challenge } = request.body;
  functions.logger.info("challenge", challenge);
  response.send({ challenge });
});

export const interactivity = functions.https.onRequest(
  (request, response) => {
    const { payload } = request.body;
    functions.logger.info("interactivity webhook", payload, {
      structuredData: true,
    });
    response.send(payload);
  }
);

export const getTemplate = functions.https.onRequest((request, response) => {
  const { command, text } = request.body;

  try {
    validateCommand(command, Command.TEMPLATE);
    validateRequest(request);
    if (text) {
      functions.logger.info(`template was entered with the text "${text}"`);
    }
  } catch (exception) {
    functions.logger.error(exception);
    const { status, ...errorResponse } = toResponse(exception);
    response.status(status).send(errorResponse);
    return;
  }

});

const validateCommand = (requestCommand: string, command: Command) => {
  if (requestCommand !== command) {
    throw new IllegalArgumentException(`invalid command ${command}`);
  }
};

const validateRequest = (request: functions.https.Request) => {
  const {
    "x-slack-request-timestamp": timestamp,
    "x-slack-signature": signature,
  } = request.headers;

  const { body } = request;
  const signingInfo = new SigningInfo(timestamp, body, signature);
  validationService.validateRequest(functions.config().slack.signing.secret, signingInfo);
};

export const getCategory = functions.https.onRequest((request, response) => {
  const { command, text } = request.body;

  functions.logger.info('before processing request');
  try {
    validateCommand(command, Command.CATEGORY);
    validateRequest(request);
    if (text) {
      functions.logger.info(`category was entered with the text "${text}"`);
    }
    categoryService.listCategories().subscribe((data) => {
      const categoryBlock = templateService.createCategoryBlock(data);
      functions.logger.info("response", categoryBlock);
      response.send(categoryBlock);
    });
  } catch (exception) {
    functions.logger.error(exception);
    const { status, ...errorResponse } = toResponse(exception);
    response.status(status).send(errorResponse);
    return;
  }
});
