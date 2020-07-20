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

