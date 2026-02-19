import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class IpLocationService {
  private readonly logger = new Logger(IpLocationService.name);

  async getCountryFromIp(ip: string): Promise<string | null> {
    try {
      if (!ip || ip === "::1" || ip === "127.0.0.1") {
        return "IN";
      }

      const data = await axios.get(`https://ipapi.co/${ip}/json`);
      console.log("IP Location Data:", data);
      const country = data?.data?.country_code || null;
      return country;
    } catch (error) {
      this.logger.error(`Failed to fetch country for IP: ${ip}`);
      return null;
    }
  }
}
