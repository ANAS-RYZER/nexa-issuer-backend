import {
  Body,
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

  @Post('token')
    // @UseGuards(JwtAuthGuard)
   async generateToken(@Req() req: Request) {
    //   const issuerId = (req as any).user?.userId;

    //   if (!issuerId) {
    //     throw new ForbiddenException('Unauthorized');
    //   }

    const token = await this.kybService.generateAccessToken();
    return {
        success: true,
        message: 'Access token generated successfully',
        data: token,
    };
   }

   @Post('create-application')
   async createapplication(@Body() dto: CreateKybCompanyDto) {
    const result = await this.kybService.createCompanyAndGenerateToken(
        dto.companyName,
        dto.country,
    );

    return {
        success: true,
        message: 'KYB applicant created and SDK token generated',
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
}