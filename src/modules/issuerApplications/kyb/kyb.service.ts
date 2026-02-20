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
    const path = '/resources/applicants?levelName=kyb-ryzer-test';
    const url = `${this.baseUrl}${path}`;
const issuerId = `business_${Date.now()}`;
    const payload = {
      externalUserId: issuerId,  
      fixedInfo: {
        companyInfo: {
          companyName,
          country,
        },
        type:"company"
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

 async generateAccessToken() {
  const path = '/resources/accessTokens/sdk';
  const url = `${this.baseUrl}${path}`;

  const payload = {
    userId: '12346',   // must be applicantId
    levelName: 'kyb-ryzer-test',
  };

  // IMPORTANT: stringify once
  const body = JSON.stringify(payload);

  const ts = Math.floor(Date.now() / 1000);
  const signature = this.sign(ts, 'POST', path, body);

  try {
    const response = await axios({
      method: 'POST',
      url,
      data: body,                 // send EXACT same string you signed
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
      message: 'Sumsub access token generation failed',
      error: err.response?.data || err.message,
    });
  }
}

async createCompanyAndGenerateToken(
  companyName: string,
  country: string,
) {
  /* ---------------- CREATE APPLICANT ---------------- */
  const applicantPath = '/resources/applicants?levelName=kyb-ryzer-test';
  const applicantUrl = `${this.baseUrl}${applicantPath}`;

  const issuerId = '123456'; // replace with real issuerId from DB/JWT

  const applicantPayload = {
    externalUserId: issuerId,
    type: 'company',
    fixedInfo: {
      companyInfo: {
        companyName,
        country,
      },
    },
  };

  const applicantBody = JSON.stringify(applicantPayload);
  const ts1 = Math.floor(Date.now() / 1000);
  const sig1 = this.sign(ts1, 'POST', applicantPath, applicantBody);

  let applicantId: string;

  try {
    const applicantRes = await axios.post(applicantUrl, applicantPayload, {
      headers: {
        'X-App-Token': this.token,
        'X-App-Access-Ts': ts1.toString(),
        'X-App-Access-Sig': sig1,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    applicantId = applicantRes.data.id; // Sumsub returns applicant id
  } catch (error) {
    const err = error as AxiosError<any>;
    throw new InternalServerErrorException({
      message: 'Applicant creation failed',
      error: err.response?.data || err.message,
    });
  }

  /* ---------------- GENERATE SDK TOKEN ---------------- */

  const tokenPath = '/resources/accessTokens/sdk';
  const tokenUrl = `${this.baseUrl}${tokenPath}`;

  const tokenPayload = {
    userId: applicantId,      // MUST be applicantId from step 1
    levelName: 'kyb-ryzer-test',
  };

  const tokenBody = JSON.stringify(tokenPayload);
  const ts2 = Math.floor(Date.now() / 1000);
  const sig2 = this.sign(ts2, 'POST', tokenPath, tokenBody);

  try {
    const tokenRes = await axios.post(tokenUrl, tokenPayload, {
      headers: {
        'X-App-Token': this.token,
        'X-App-Access-Ts': ts2.toString(),
        'X-App-Access-Sig': sig2,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    return {
      applicantId,
      sdkToken: tokenRes.data,
    };
  } catch (error) {
    const err = error as AxiosError<any>;
    throw new InternalServerErrorException({
      message: 'Token generation failed',
      error: err.response?.data || err.message,
    });
  }
}

}