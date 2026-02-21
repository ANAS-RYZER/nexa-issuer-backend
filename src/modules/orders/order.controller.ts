import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Patch
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './order.service'
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {UpdateOrderStatusDto} from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders/:assetId
   * Create a new order for the given asset (requires authentication and KYC)
   */
  @Post(':assetId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('assetId') assetId: string,
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ) {
    // Get investor ID from JWT token
    const investorId = (req as any).user?.userId;
    if (!investorId) throw new ForbiddenException('Unauthorized');

    // Call service to create order
    const order = await this.ordersService.createOrder(assetId, investorId, createOrderDto);

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    // Get investor ID from JWT token
    const investorId = (req as any).user?.userId;
    if (!investorId) throw new ForbiddenException('Unauthorized');
    return this.ordersService.updateOrderStatus(investorId, orderId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyOrders(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const investorId = (req as any).user?.userId;
    if (!investorId) throw new ForbiddenException('Unauthorized');

    const result = await this.ordersService.getUserOrders(
      investorId,
      Number(page),
      Number(limit),
    );

    return {
      success: true,
      message: result.message,
      data: result.orders,
      pagination: result.pagination,
    };
  }
  
  /**
   * GET /orders/:id
   * Get single order by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: Request) {
    // Get investor ID from JWT token
    const investorId = (req as any).user?.userId;
    if (!investorId) throw new ForbiddenException('Unauthorized');

    // Fetch order with minimal asset details
    const orderResponse = await this.ordersService.findById(id);

    // Check if the investor owns this order
    if (orderResponse.order.investorId.toString() !== investorId.toString()) {
      throw new ForbiddenException('You are not allowed to view this order');
    }

    // Return only relevant fields (including asset details)
    return {
      success: true,
      data: {
        _id: orderResponse.order._id,
        investorId: orderResponse.order.investorId,
        numberOfTokens: orderResponse.order.numberOfTokens,
        investorAmount: orderResponse.order.investorAmount,
        investorPaidAmount: orderResponse.order.investorPaidAmount,
        investorCurrency: orderResponse.order.investorCurrency,
        status: orderResponse.order.status,
        createdAt: orderResponse.order.createdAt,
        updatedAt: orderResponse.order.updatedAt,
        asset: orderResponse.order.asset, // includes minimal asset details
      },
    };
  }
}
