import * as crypto from 'crypto';
import { TimeoutException, UnauthorizedException, IllegalArgumentException } from '../exception/exceptions';
import { SigningInfo } from '../model/model.category';


export class ValidationService {
    readonly version: string = 'v0';
    readonly signatureType: string = 'sha256';
    readonly digestEncoding: any = 'hex';
    readonly contentsEncoding: any = 'utf8';
    readonly requestTimeLimit: number = 60 * 5 * 1000;

    validateRequest(signingSecret: string, signingInfo: SigningInfo): void {
        if (!signingInfo.timestamp || !signingInfo.signature) {
            throw new IllegalArgumentException("invalid signing information");
        }
        const currentTime: number = new Date().getTime();
        const contents: string = [this.version, signingInfo.timestamp, signingInfo.getBody()].join(':');
        if (signingInfo.timestamp) {
            const timeStampToMilli = signingInfo.timestamp + this.requestTimeLimit;
            if (currentTime > timeStampToMilli) {
                throw new TimeoutException("Unauthorized request");
            } else {
                console.log(`buffer for signature ${contents}`);
                const secret = crypto.createHmac(this.signatureType, signingSecret)
                    .update(contents, this.contentsEncoding)
                    .digest(this.digestEncoding);

                console.log('comparing signatures now');
                if (crypto.timingSafeEqual(Buffer.from(signingInfo.signature), Buffer.from(secret))) {
                    throw new UnauthorizedException("Unauthorized request");
                }
            }
        } else {
            throw new UnauthorizedException("Unauthorized request");
        }
    }
}