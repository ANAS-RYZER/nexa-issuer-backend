import {
  Body,
  Get,
  Param,
  Controller,
  Post,
  UseGuards,
  ForbiddenException,
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { Request } from 'express';
import { KybService } from './kyb.service';
import { CreateKybCompanyDto } from './dto/create-kyb.dto';
import { JwtAuthGuard } from '../../authIssuer/guards/jwt-auth.guard';

@Controller('kyb')
export class KybController {
  constructor(private readonly kybService: KybService) {}

  @Post('create-company')
//   @UseGuards(JwtAuthGuard)
  async createCompany(
    @Body() dto: CreateKybCompanyDto,
    @Req() req: Request,
  ) {
    // const issuerId = (req as any).user?.userId;

    // if (!issuerId) {
    //   throw new ForbiddenException('Unauthorized');
    // }

    const result = await this.kybService.createCompanyApplicant(
    //   issuerId,               // pass issuer id
      dto.companyName,
      dto.country,
    );

    return {
      success: true,
      message: 'Company applicant created successfully',
      data: result,
    };
  }


    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    handleWebhook(@Body() payload: any) {

        console.log('Webhook received:', payload);

        // do any processing here
        const response = {
        success: true,
        message: 'Webhook received successfully',
        receivedData: payload,
        };

        return response;
    }

  @Get('applicant/:applicantId')
  getApplicant(@Param('applicantId') applicantId: string) {
      return this.kybService.getApplicant(applicantId); 
}

@Post('kyb-link')
  async createKybLink(
    @Body()
    body: {
      levelName: string;
      applicantId: string;
    },
  ) {
    return this.kybService.generateHostedKybLink(
      body.levelName,
      body.applicantId,
    );
  }

@Post('create-applicant')
@UseGuards(JwtAuthGuard)
async create(
  @Body() dto: CreateKybCompanyDto,
  @Req() req: Request,
) {
  const issuerId = (req as any).user?.userId;
  if (!issuerId) {
      throw new ForbiddenException('Unauthorized');
    }
  const result = await this.kybService.createCompanyAndGenerateLink(
    issuerId,
    dto.companyName,
    dto.country,
  );

  return {
    success: true,
    message: 'Company created & KYB link generated',
    data: result,
  };
}

}