import { IllegalArgumentException } from "../exception";
import { ErrorCode } from "./enum";

export interface Category {
    id: number;
    title: string;
    categoryType: string;
}

export interface ErrorResponse {
    code?: ErrorCode;
    message: string;
    status: number;
}

export interface Template {
    id: number;
    headerText: string;
    foregroundImage: string;
}

export interface PagedResponse<T> {
    lastPage?: boolean
    paging?: Page;
    items?: Array<T>;
}

export interface VouchrError {
    errorMessage?: string
    error: ErrorDetails
}

export interface ErrorDetails {
    errorEnum: string;
    httpStatus: number;
    code: number;
    message?: string;
    displayTitle?: string;
    displayDetail?: string;
}

interface Page {
    next?: string;
    current?: string;
}

export class SigningInfo {
    private _timestamp: number;
    private body: Array<String> = [];

    constructor(timestamp: any, body: any, private _signature: any) {
        if (isNaN(timestamp)) {
            throw new IllegalArgumentException("expected number for timestamp");
        }
        this._timestamp = parseInt(timestamp);

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

    public get signature(): string {
        return this._signature;
    }
}
