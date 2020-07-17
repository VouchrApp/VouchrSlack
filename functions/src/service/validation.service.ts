import * as functions from 'firebase-functions';
import * as crypto from 'crypto';
import { TimeoutException, UnauthorizedException } from '../exception/exceptions';


export class ValidationService {
    readonly version: string = 'v0';

    validateRequest(signingSecret: string, request: functions.https.Request): void {
        let currentTime: number = new Date().getTime();
        const { 'X-Slack-Request-Timestamp': timestamp } = request.headers;
        const contents: string = [this.version, timestamp, request.body].join(':');
        if (timestamp && parseInt(timestamp.toString())) {
            let timeStampToMilli = parseInt(timestamp.toString()) * 60 * 5 * 1000;
            if (currentTime > timeStampToMilli) {
                throw new TimeoutException("request was made a while ago");
            } else {
                let secret = crypto.createHmac('sha256', signingSecret)
                    .update(contents)
                    .digest('hex');

                if (crypto.timingSafeEqual(Buffer.from(signingSecret), Buffer.from(secret))) {
                    throw new UnauthorizedException("unauthorized request");
                }
            }
        }
    }
}