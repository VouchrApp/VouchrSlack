import Axios from "axios-observable";
import * as functions from "firebase-functions";
import * as httpStatus from "http-status";
import { IllegalArgumentException, InvalidMethodException, toResponse } from "./exception";
import { Command, findCommand, METHOD, SigningInfo, VouchrError, SlackResponseType } from "./vouchr";
import { BlockKitBuilder, CategoryService, TemplateService, ValidationService } from "./service";
import { AxiosError } from "axios";
import { batchSettings } from "./vouchr/util";
const { PubSub } = require('@google-cloud/pubsub');


let validationService: ValidationService;
let templateService: TemplateService;

const categoryService = new CategoryService();
const blockKitBuilder = new BlockKitBuilder();
const pubSubClient = new PubSub();
const commandTopic = 'handle-command' as string;
const templateInteraction = 'handle-template' as string;

const validateRequest = (request: functions.https.Request) => {
  const {
    "x-slack-request-timestamp": timestamp,
    "x-slack-signature": signature,
  } = request.headers;

  const { body } = request;
  const signingInfo = new SigningInfo(timestamp, body, signature);
  if (!validationService) {
    validationService = new ValidationService();
  }
  validationService.validateRequest(functions.config().slack.signing.secret, signingInfo);
};

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
    const { value, text: { text } } = action.selected_option
    const message = JSON.stringify({
      id: value,
      text: text,
      url: response_url
    });

    const dataBuffer = Buffer.from(message);
    pubSubClient.topic(templateInteraction, { batching: batchSettings }).publish(dataBuffer);
    response.status(httpStatus.OK).send();
  } catch (exception) {
    functions.logger.error(exception);
    const { status, ...errorResponse } = toResponse(exception);
    response.status(status).send(errorResponse);
  }
});

export const handleTemplate = functions.pubsub.topic(templateInteraction).onPublish((message, context) => {
  const { id, url } = message.json;
  if (!templateService) {
    templateService = new TemplateService();
  }
  templateService.listTemplates(id)
    .subscribe(data => postResponse(url, blockKitBuilder.createTemplateBlock(data)));
});

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

export const handleCommand = functions.pubsub.topic(commandTopic).onPublish((message, context) => {
  const { text, url, command } = message.json;
  functions.logger.info("message from pubsub", message);
  if (Command.Category === command) {
    if (!text) {
      categoryService.listCategories()
        .subscribe(
          // save data to database if we eventually go that direction
          data => postResponse(url, blockKitBuilder.createCategoryBlock(data)),
          (error: AxiosError<VouchrError>) => {
            if (error.response?.status === httpStatus.BAD_REQUEST) {
              functions.logger.error("invalid request sent", JSON.stringify(error.response.data));
              postResponse(url, {
                "response_type": SlackResponseType.PRIVATE,
                "text": "Unable to retrieve categories. Please try again!"
              })
            }
          });
    }
  }
});

const postResponse = (url: string, data: object) => {
  Axios.post(url, data)
    .subscribe(
      response => functions.logger.log("message was successfully sent", JSON.stringify(response.data)),
      error => functions.logger.error("message was unsuccessfully sent", JSON.stringify(error.response.data))
    )
}

const publishCommand = (command: string, text: string, url: string, user: object) => {
  const message = JSON.stringify({
    text: text,
    command: command,
    url: url,
    user: user
  });

  const dataBuffer = Buffer.from(message);
  pubSubClient.topic(commandTopic, { batching: batchSettings }).publish(dataBuffer);
}
