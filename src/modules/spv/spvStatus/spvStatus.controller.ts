import {
  Controller,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth_issuer/guards/jwt-auth.guard';
import { SpvStatusService } from './spvStatus.service';
import { CreateSpvStatusDto } from './dto/create-spv-status.dto';

@Controller('spv-status')
export class SpvStatusController {
  constructor(private readonly service: SpvStatusService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Query('spvId') spvId: string,
    @Body() dto: CreateSpvStatusDto,
  ) {
    const issuerId = req.user?.userId;
    const data = await this.service.createSpvStatus(
      issuerId,
      spvId,
      dto,
    );

    return {
      message: 'SPV status created successfully',
      data,
    };
  }
}
