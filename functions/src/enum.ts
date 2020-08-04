export const Command = {
    Category: '/category',
    Template: '/template',
} as const;

export type Command = typeof Command[keyof typeof Command]

export const findCommand = (command: string): Command | undefined => {
    return Object.values(Command).find(element => element === command);
}

export enum ErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    ILLEGAL_ARGUMENTS = "ILLEGAL_ARGUMENTS",
    INVALID_METHOD = "INVALID_METHOD",
}


export enum METHOD {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
}


