import { ErrorCode } from "../enum";

export class Error {
    constructor(private _message: string, private _name: string, private _code?: number, private _stack?: string | undefined) { }

    public get message(): string {
        return this._message;
    }

    public get name(): string {
        return this._name;
    }

    get code(): number | undefined {
        return this._code;
    }

    public get cause(): string | undefined {
        return this._stack;
    }
}

export class TimeoutException extends Error {
    constructor(message: string, stack?: string) {
        super(message, 'TimeoutException', ErrorCode.TIMEOUT, stack);
    }
}

export class UnauthorizedException extends Error {
    constructor(message: string, stack?: string) {
        super(message, 'UnauthorizedException', ErrorCode.UNAUTHORIZED, stack);
    }
}

