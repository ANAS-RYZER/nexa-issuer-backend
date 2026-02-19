import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class IpGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const ip =
      request.headers["x-forwarded-for"]?.split(",")[0] ||
      request.ip ||
      request.socket?.remoteAddress ||
      null;

    // attach to request so you can use later
    request.userIp = ip;

    return true;
  }
}
