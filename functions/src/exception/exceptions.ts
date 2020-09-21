import * as status from "http-status";
import { ErrorCode, SlackResponseType } from "../vouchr/enum";
import { ErrorResponse } from "../vouchr/model";

export interface Error {
  message: string;
  name: string;
  code?: ErrorCode;
  cause?: any;
}

const errorMap = new Map();
errorMap.set(ErrorCode.UNAUTHORIZED, status.UNAUTHORIZED);
errorMap.set(ErrorCode.ILLEGAL_ARGUMENTS, status.BAD_REQUEST);
errorMap.set(ErrorCode.INVALID_METHOD, status.METHOD_NOT_ALLOWED);

export class Exception implements Error {
  constructor(
    public message: string,
    public name: string,
    public code?: ErrorCode,
    public cause?: any
  ) { }
}



export class UnauthorizedException extends Exception {
  constructor(message: string, stack?: string) {
    super(message, "UnauthorizedException", ErrorCode.UNAUTHORIZED, stack);
  }
}

export class IllegalArgumentException extends Exception {
  constructor(message: string, stack?: string) {
    super(message, "IllegalArgumentException", ErrorCode.ILLEGAL_ARGUMENTS, stack);
  }
}

export class InvalidMethodException extends Exception {
  constructor(message: string, stack?: string) {
    super(message, "InvalidMethodException", ErrorCode.INVALID_METHOD, stack);
  }
}

const resolveCode = (code: ErrorCode | undefined): number => {
  if (!!code && errorMap.has(code)) {
    return errorMap.get(code);
  }
  return status.UNAUTHORIZED;
};

export const toResponse = (exception: Error): ErrorResponse => {
  const response = {
    message: exception.message,
    status: resolveCode(exception.code),
    code: exception.code,
  };

  if (!response.code) {
    delete response.code;
  }
  return response;
};
