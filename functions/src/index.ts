import * as functions from "firebase-functions";
import { findCommand, Command } from "./enum";
import { ValidationService } from "./service/validation.service";
import { toResponse, IllegalArgumentException } from "./exception";
import { CategoryService } from "./service/category.service";
import { BlockKitBuilder } from "./service/builder.block-kit";
import { SigningInfo } from "./model/model.category";
import { TemplateService } from "./service/api.service";
import { from, Observable } from "rxjs";
import * as status from "http-status";


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

const validationService = new ValidationService();
const categoryService = new CategoryService();
const blockKitBuilder = new BlockKitBuilder();
const templateService = new TemplateService();
const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();
const topic = 'category';
const subscriptionName = 'getCategory';

export const getEvent = functions.https.onRequest((request, response) => {
  functions.logger.info("Event subscription!", { structuredData: true });
  const { challenge } = request.body;
  functions.logger.info("challenge", challenge);
  response.send({ challenge });
});

export const interactivity = functions.https.onRequest((request, response) => {
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

export const getTemplate = functions.https.onRequest((request, response) => {
  const { command, text } = request.body;

  try {
    if (!findCommand(command)) {
      throw new IllegalArgumentException(`invalid command supplied ${command}`);
    }
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
  try {
    validateRequest(request);
    const { command, text, response_url, user_name, user_id } = request.body;
    if (!findCommand(command)) {
      throw new IllegalArgumentException(`invalid command supplied ${command}`);
    }

    await publishCommand(command, text, response_url, {
      id: user_id,
      name: user_name
    });
    response.sendStatus(status.OK);
  } catch (exception) {
    functions.logger.error(exception);
    const { status, ...errorResponse } = toResponse(exception);
    response.status(status).send(errorResponse);
    return;
  }
});


const publishCommand = (command: string, text: string, url: string, user: any) => {
  const message = {
    text: text,
    command: command,
    url: url,
    user: user
  };

  const attributes = {
    key: functions.config().vouchr.key
  };

  const dataBuffer = Buffer.from(JSON.stringify(message));
  pubSubClient.topic(topic).publish(dataBuffer, attributes);
}

const handleCommand = () => {
  const subscription = pubSubClient.subscription(subscriptionName);
  subscription.on('message', (message: any) => {
    const { command } = message.data;
    if (Command.Category === command) {

      categoryService.listCategories()
        .subscribe((data) => {
          const categoryBlock = blockKitBuilder.createCategoryBlock(data);
          functions.logger.info("response", categoryBlock);
        });
    }
    //send message to url
    message.ack();
  });
}

handleCommand();

