import { IllegalArgumentException } from "../exception"
import { ErrorCode, ResponseStatus } from "../enum";

export interface Category {
    id: number;
    title: string;
    categoryType: string;
}

export interface ErrorResponse {
    code?: ErrorCode;
    message: string;
    status: ResponseStatus;
}

export class SigningInfo {
    private _timestamp: number;
    private body: Array<String> = [];

    constructor(timestamp: any, body: any) {
        if (isNaN(timestamp)) {
            throw new IllegalArgumentException("expected number for timestamp");
        }
        this._timestamp = parseInt(timestamp) * 1000;

        for (const [key, value] of Object.entries(body)) {
            console.log([key, value].join('='));
            this.body.push([key, value].join('='));
        }
    }

    public get timestamp(): number {
        return this._timestamp;
    }

    public getBody(): string {
        return this.body.join('&');
    }
}
