import { ErrorCode, ResponseStatus, resolveCode } from "../enum";
import { ErrorResponse } from "../model/model.category";

export interface Error {
    message: string;
    name: string;
    code?: number;
    cause?: any
}

export class Exception implements Error {
    constructor(public message: string, public name: string, public code?: number, public cause?: any) { }
}

export class TimeoutException extends Exception {
    constructor(message: string, stack?: string) {
        super(message, 'TimeoutException', ErrorCode.TIMEOUT, stack);
    }
}

export class UnauthorizedException extends Exception {
    constructor(message: string, stack?: string) {
        super(message, 'UnauthorizedException', ErrorCode.UNAUTHORIZED, stack);
    }
}

export class IllegalArgumentException extends Exception {
    constructor(message: string, stack?: string) {
        super(message, 'IllegalArgumentException', ErrorCode.ILLEGAL_ARGUMENTS, stack);
    }
}

export const toResponse = (exception: Error): ErrorResponse => {
    let response = {
        message: exception.message,
        status: resolveCode(exception.code),
        code: exception.code
    }

    if (!response.code) {
        delete response.code;
    }
    return response;
}

