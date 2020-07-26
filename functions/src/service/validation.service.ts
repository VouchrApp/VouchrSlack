import * as crypto from "crypto";
import {
  UnauthorizedException,
  IllegalArgumentException,
} from "../exception/exceptions";
import { SigningInfo } from "../model/model.category";

export class ValidationService {
  readonly version: string = "v0";
  readonly signatureType: string = "sha256";
  readonly digestEncoding: any = "hex";
  readonly requestTimeLimit: number = 60 * 5;

  validateRequest(signingSecret: string, signingInfo: SigningInfo): void {
    if (!signingInfo.timestamp || !signingInfo.signature) {
      throw new IllegalArgumentException("invalid signing information");
    }
    const currentTime: number = Math.floor(new Date().getTime() / 1000);
    const baseString: string = [
      this.version,
      signingInfo.timestamp,
      signingInfo.getBody(),
    ].join(":");
    if (signingInfo.timestamp) {
      const timeStampToMilli = signingInfo.timestamp + this.requestTimeLimit;
      if (currentTime > timeStampToMilli) {
        throw new UnauthorizedException("Unauthorized request");
      } else {
        console.log(`buffer for signature ${baseString}`);
        const calculatedSignature = crypto
          .createHmac(this.signatureType, signingSecret)
          .update(baseString)
          .digest(this.digestEncoding);
        if (
          crypto.timingSafeEqual(
            Buffer.from(signingInfo.signature),
            Buffer.from(`v0=${calculatedSignature}`)
          )
        ) {
          throw new UnauthorizedException("Unauthorized request");
        }
      }
    } else {
      throw new UnauthorizedException("Unauthorized request");
    }
  }
}
