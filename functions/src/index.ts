import Axios from "axios-observable";
import * as functions from "firebase-functions";
import * as httpStatus from "http-status";
import {
  IllegalArgumentException,
  InvalidMethodException, toResponse
} from "./exception";
import { Command, findCommand, METHOD, SigningInfo, VouchrErrorResponse } from "./vouchr";
import {
  BlockKitBuilder, CategoryService, TemplateService, ValidationService
} from "./service";
import { AxiosError } from "axios";
import { HttpsError } from "firebase-functions/lib/providers/https";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

const validationService = new ValidationService();
const categoryService = new CategoryService();
const blockKitBuilder = new BlockKitBuilder();
const templateService = new TemplateService();
const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();
const topic = 'command' as string;

export const resolveEvent = functions.https.onRequest((request, response) => {
  functions.logger.info("Event subscription!", { structuredData: true });
  const { challenge } = request.body;
  functions.logger.info("challenge", challenge);
  response.status(httpStatus.OK).send();
});

export const resolveInteraction = functions.https.onRequest((request, response) => {
  try {
    validateRequest(request);
    const { payload } = request.body;
    const { actions, response_url } = JSON.parse(payload);

    functions.logger.info("response url in payload", response_url);

    const action = actions.find((act: { action_id: string; }) => act.action_id === blockKitBuilder.CATEGORY_BLOCK);
    const { value } = action.selected_option

    templateService.listTemplates(value)
      .subscribe((data) => {
        const templateBlock = blockKitBuilder.createTemplateBlock(data);
        functions.logger.info("response", templateBlock);
        response.send(templateBlock);
      });

  } catch (exception) {
    functions.logger.error(exception);
    const { status, ...errorResponse } = toResponse(exception);
    response.status(status).send(errorResponse);
  }
});


const validateRequest = (request: functions.https.Request) => {
  const {
    "x-slack-request-timestamp": timestamp,
    "x-slack-signature": signature,
  } = request.headers;

  const { body } = request;
  const signingInfo = new SigningInfo(timestamp, body, signature);
  validationService.validateRequest(functions.config().slack.signing.secret, signingInfo);
};

export const resolveCommand = functions.https.onRequest((request, response) => {
  try {
    if (request.method !== METHOD.POST) {
      throw new InvalidMethodException(`method type ${request.method} not supported`)
    }
    validateRequest(request);

    const { command, text, response_url, user_name, user_id } = request.body;
    if (!findCommand(command)) {
      throw new IllegalArgumentException(`invalid command supplied ${command}`);
    }
    publishCommand(command, text as string, response_url, {
      id: user_id,
      name: user_name
    });
    response.status(httpStatus.OK).send();
  } catch (exception) {
    functions.logger.error(exception);
    const { status, ...errorResponse } = toResponse(exception);
    response.status(status).send(errorResponse);
    return;
  }
});

export const handleCommand = functions.pubsub.topic(topic).onPublish((message, context) => {
  const { text, url, command } = message.json;
  functions.logger.info("message from pubsub", message);
  try {
    if (Command.Category === command) {
      if (!text) {
        categoryService.listCategories()
          .subscribe(
            data => Axios.post(url, blockKitBuilder.createCategoryBlock(data)),
            (error: AxiosError<VouchrErrorResponse>) => {
              if (error.response?.status === httpStatus.BAD_REQUEST) {

              }
            });
      }
    }
  } catch (exception) {
    functions.logger.error(exception);
  }

})


const publishCommand = (command: string, text: string, url: string, user: any) => {
  const message = {
    text: text,
    command: command,
    url: url,
    user: user
  };

  const dataBuffer = Buffer.from(JSON.stringify(message));
  pubSubClient.topic(topic).publish(dataBuffer);
}
