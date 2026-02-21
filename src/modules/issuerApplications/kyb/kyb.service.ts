import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KybService {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly secret: string;

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.get<string>('KYB_BASE_URL')!;
    this.token = this.config.get<string>('KYB_APP_TOKEN')!;
    this.secret = this.config.get<string>('KYB_SECRET_KEY')!;
  }

  private sign(ts: number, method: string, path: string, body: string) {
    const data = ts + method.toUpperCase() + path + body;

    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
  }

  async createCompanyApplicant(
    // issuerId: string,
    companyName: string,
    country: string,
  ) {
    const path = '/resources/applicants?levelName=kyb-level';
    const url = `${this.baseUrl}${path}`;
    const issuerId = `business_${Date.now()}`;
    const payload = {
      externalUserId: issuerId,
      type: "company",
      info: {
        companyInfo: {
        companyName,
        country,
        }
      },
      fixedInfo: {
        companyInfo: {
          companyName,
          country,
        },
      },
  };

    const body = JSON.stringify(payload);
    const ts = Math.floor(Date.now() / 1000);
    const signature = this.sign(ts, 'POST', path, body);

    try {
      const response = await axios.post(url, payload, {
        timeout: 15000,
        headers: {
          'X-App-Token': this.token,
          'X-App-Access-Ts': ts,
          'X-App-Access-Sig': signature,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<any>;

      throw new InternalServerErrorException({
        message: 'KYB applicant creation failed',
        error: err.response?.data || err.message,
      });
    }
  }


async getApplicant(applicantId: string) {
  try {
    const method = 'GET';
    const path = `/resources/applicants/${applicantId}/one`;
    const ts = Math.floor(Date.now() / 1000).toString();

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(ts + method + path)
      .digest('hex');

    const response = await axios.get(`${this.baseUrl}${path}`, {
      headers: {
        'X-App-Token': this.token,
        'X-App-Access-Ts': ts,
        'X-App-Access-Sig': signature,
      },
    });

    return response.data;

  } catch (error: any) {
    console.error('Sumsub get applicant error:', error?.response?.data || error.message);
    throw new InternalServerErrorException('Failed to fetch applicant from Sumsub');
  }
}

async generateHostedKybLink(levelName: string, applicantId: string) {
    const path = '/resources/sdkIntegrations/levels/-/websdkLink';
    const url = `${this.baseUrl}${path}`;

    const payload = {
      levelName,
      userId: applicantId,   // must be Sumsub applicantId
      ttlInSecs: 1800,
    };

    const body = JSON.stringify(payload);
    const ts = Math.floor(Date.now() / 1000);
    const signature = this.sign(ts, 'POST', path, body);

    try {
      const response = await axios.post(url, body, {
        headers: {
          'X-App-Token': this.token,
          'X-App-Access-Ts': ts.toString(),
          'X-App-Access-Sig': signature,
          'Content-Type': 'application/json',
        },
      });

      return {
        kybLink: response.data.url,
      };
    } catch (error) {
      const err = error as AxiosError<any>;
      throw new InternalServerErrorException({
        message: 'Sumsub KYB link generation failed',
        error: err.response?.data || err.message,
      });
    }
  }

async createCompanyAndGenerateLink(
  issuerId: string,
  companyName: string,
  country: string,
) {
  // ---------- CREATE APPLICANT ----------
  const applicantPath = '/resources/applicants?levelName=kyb-level';
  const applicantUrl = `${this.baseUrl}${applicantPath}`;

  const applicantPayload = {
    externalUserId: issuerId,
    type: "company",
    info: {
      companyInfo: { companyName, country },
    },
    fixedInfo: {
      companyInfo: { companyName, country },
    },
  };

  const applicantBody = JSON.stringify(applicantPayload);
  const ts1 = Math.floor(Date.now() / 1000);
  const sig1 = this.sign(ts1, 'POST', applicantPath, applicantBody);

  let applicantId: string;

  try {
    const applicantRes = await axios.post(applicantUrl, applicantPayload, {
      timeout: 15000,
      headers: {
        'X-App-Token': this.token,
        'X-App-Access-Ts': ts1,
        'X-App-Access-Sig': sig1,
        'Content-Type': 'application/json',
      },
    });

    applicantId = applicantRes.data.id;
  } catch (error) {
    const err = error as AxiosError<any>;
    throw new InternalServerErrorException({
      message: 'KYB applicant creation failed',
      error: err.response?.data || err.message,
    });
  }

  // ---------- GENERATE HOSTED LINK ----------
  const linkPath = '/resources/sdkIntegrations/levels/-/websdkLink';
  const linkUrl = `${this.baseUrl}${linkPath}`;

  const linkPayload = {
    levelName: 'kyb-level',
    userId: applicantId,
    ttlInSecs: 1800,
  };

  const linkBody = JSON.stringify(linkPayload);
  const ts2 = Math.floor(Date.now() / 1000);
  const sig2 = this.sign(ts2, 'POST', linkPath, linkBody);

  try {
    const linkRes = await axios.post(linkUrl, linkBody, {
      headers: {
        'X-App-Token': this.token,
        'X-App-Access-Ts': ts2.toString(),
        'X-App-Access-Sig': sig2,
        'Content-Type': 'application/json',
      },
    });

    return {
      applicantId,
      kybLink: linkRes.data.url,
    };

  } catch (error) {
    const err = error as AxiosError<any>;
    throw new InternalServerErrorException({
      message: 'Sumsub KYB link generation failed',
      error: err.response?.data || err.message,
    });
  }
}

}