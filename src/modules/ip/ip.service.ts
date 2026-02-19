import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import axios from "axios";

@Injectable()
export class IpLocationService {
  private readonly logger = new Logger(IpLocationService.name);

  async getCurrencyFromIp(ip: string): Promise<string | null> {
    try {
      if (!ip || ip === "::1" || ip === "127.0.0.1") {
        return "EUR";
      }

      const data = await axios.get(`https://ipapi.co/${ip}/json`);
      console.log("IP Location Data:", data);
      const currency = data?.data?.currency || null;
      return currency ? currency : null;
    } catch (error) {
      // this.logger.error(`Failed to fetch country for IP: ${ip}`);
      console.log("IP Location Error:", error);
      throw new InternalServerErrorException(error);
    }
  }
}
