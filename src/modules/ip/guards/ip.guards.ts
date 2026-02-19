import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { IpLocationService } from "../ip.service";

@Injectable()
export class IpGuard implements CanActivate {
  constructor(private readonly ipLocationService: IpLocationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const ip =
      request.headers["x-forwarded-for"]?.split(",")[0] ||
      request.ip ||
      request.socket?.remoteAddress ||
      null;

    request.userIp = ip;

    const currency = await this.ipLocationService.getCurrencyFromIp(ip);

    request.userCurrency = currency;

    return true;
  }
}
