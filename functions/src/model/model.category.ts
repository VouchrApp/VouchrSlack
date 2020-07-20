import { IllegalArgumentException } from "../exception"

export interface Category {
    id: number;
    title: string;
    categoryType: string;
}

export class SigningInfo {
    private _timestamp: number;
    private body: Array<String> = [];

    constructor(timestamp: any, body: any) {
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
}