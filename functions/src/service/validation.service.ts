import * as crypto from 'crypto';
import { TimeoutException, UnauthorizedException } from '../exception/exceptions';


export class ValidationService {
    readonly version: string = 'v0';

    validateRequest(signingSecret: string, signingInfo: { timestamp: any; body: any; }): void {
        const currentTime: number = new Date().getTime();
        const timestamp = signingInfo.timestamp;
        const contents: string = [this.version, timestamp, signingInfo.body].join(':');
        if (timestamp && parseInt(timestamp.toString())) {
            const timeStampToMilli = parseInt(timestamp.toString()) * 60 * 5 * 1000;
            if (currentTime > timeStampToMilli) {
                throw new TimeoutException("request was made a while ago");
            } else {
                const secret = crypto.createHmac('sha256', signingSecret)
                    .update(contents)
                    .digest('hex');

                console.log('comparing signatures now');
                if (crypto.timingSafeEqual(Buffer.from(signingSecret), Buffer.from(secret))) {
                    throw new UnauthorizedException("unauthorized request");
                }
            }
        } else {
            throw new UnauthorizedException("unauthorized request");
        }
    }
}