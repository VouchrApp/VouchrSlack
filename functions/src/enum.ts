export enum Command {
    CATEGORY = "/category",
    TEMPLATE = '/template'
}

export enum ErrorCode {
    TIMEOUT = 100,
    UNAUTHORIZED = 400,
    ILLEGAL_ARGUMENTS = 500
}

export enum ResponseStatus {
    INTERNAL_SERVER_ERROR = 500,
    UNAUTHORIZED = 401,
    BAD_REQUEST = 400,
}

export enum METHOD {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

let errorResponseMap = new Map();
errorResponseMap.set(ErrorCode.TIMEOUT, ResponseStatus.UNAUTHORIZED);
errorResponseMap.set(ErrorCode.UNAUTHORIZED, ResponseStatus.UNAUTHORIZED);
errorResponseMap.set(ErrorCode.ILLEGAL_ARGUMENTS, ResponseStatus.BAD_REQUEST);

export const resolveCode = (code: ErrorCode | undefined): ResponseStatus => {
    if (!!code && errorResponseMap.has(code)) {
        return errorResponseMap.get(code)
    }
    return ResponseStatus.UNAUTHORIZED;
}

