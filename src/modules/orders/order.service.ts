import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Asset, AssetDocument } from '../real-estate/schema/asset.model';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ExchangeRateService } from '../exchangeRate/exchange-rate.service';


@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
     private readonly exchangeRateService: ExchangeRateService,
  ) {}

  /**
   * Create a new order for a given asset
   */
  async createOrder(
    assetId: string,
    investorId: string,
    dto: CreateOrderDto,
  ): Promise<any> {
    // Validate asset exists
    const asset = await this.assetModel.findById(assetId).lean();
    if (!asset) throw new NotFoundException('Asset not found');

    // Validate user exists and is KYC verified
    const user = await this.userModel.findById(investorId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.isKycVerified) throw new ForbiddenException('User is not KYC verified');

    // Convert investorPaidAmount to asset currency
    let investorAmountInAssetCurrency = dto.investorPaidAmount;

    if (dto.investorCurrency !== asset.currency) {
      investorAmountInAssetCurrency = await this.exchangeRateService.convert(
        dto.investorCurrency,
        asset.currency,
        dto.investorPaidAmount,
      );
    }

    // Create order
    const order = new this.orderModel({
      assetId: asset._id,
      investorId: user._id,
      numberOfTokens: dto.numberOfTokens,
      investorAmount: investorAmountInAssetCurrency,  // in asset currency
      investorCurrency: dto.investorCurrency,
      investorPaidAmount: dto.investorPaidAmount,    // original paid amount
      tokenValue: dto.tokenValue,
      status: OrderStatus.INITIATED,
    });

    const savedOrder = await order.save();

    // Prepare asset details for response
    const assetDetails = {
      _id: asset._id,
      name: asset.name,
      currency: asset.currency,
      pricePerSft: asset.pricePerSft,
      totalNumberOfSfts: asset.totalNumberOfSfts,
      location: {
        city: asset.city,
        state: asset.state,
        country: asset.country,
      },
    };

    return {
      message: 'Order created successfully',
      order: {
        _id: savedOrder._id,
        investorId: savedOrder.investorId,
        numberOfTokens: savedOrder.numberOfTokens,
        investorAmount: savedOrder.investorAmount,       // in asset currency
        investorCurrency: savedOrder.investorCurrency,
        investorPaidAmount: savedOrder.investorPaidAmount, // in user currency
        status: savedOrder.status,
        tokenValue: savedOrder.tokenValue,
        asset: assetDetails,
      },
    };
  }

// order.service.ts
async updateOrderStatus(
  investorId: string,  
  orderId: string,
  dto: UpdateOrderStatusDto,
): Promise<{ message: string; status?: OrderStatus }> {
  const order = await this.orderModel.findById(orderId);
  if (!order) throw new NotFoundException('Order not found');

  // Check if the investor owns this order
  if (order.investorId.toString() !== investorId) {
    throw new ForbiddenException('You are not authorized to update this order');
  }

  // If order is already completed
  if (order.status === OrderStatus.COMPLETED) {
    return { message: 'Your order is already successfully completed', status: order.status };
  }

  // Update status
  order.status = dto.status;
  await order.save();

  return { message: 'Order status updated successfully', status: order.status };
}

async getUserOrders(
  investorId: string,
  page: number = 1,
  limit: number = 10,
): Promise<any> {

  const skip = (page - 1) * limit;

  // fetch orders + total count in parallel
  const [orders, total] = await Promise.all([
    this.orderModel
      .find({ investorId: new Types.ObjectId(investorId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    this.orderModel.countDocuments({
      investorId: new Types.ObjectId(investorId),
    }),
  ]);

  if (!orders.length) {
    return {
      message: 'No orders found',
      orders: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
    };
  }

  // collect asset ids safely
  const assetIds = [
    ...new Set(orders.map(o => o.assetId?.toString()).filter(Boolean)),
  ].map(id => new Types.ObjectId(id));

  // fetch assets once
  const assets = await this.assetModel
    .find({ _id: { $in: assetIds } })
    .lean();

  const assetMap = new Map(
    assets.map(a => [a._id.toString(), a]),
  );

  // attach asset info (same logic, cleaner)
  const formattedOrders = orders.map(order => {
    const asset = assetMap.get(order.assetId?.toString());

    return {
      ...order,
      asset: asset
        ? {
            _id: asset._id,
            name: asset.name,
            currency: asset.currency,
            pricePerSft: asset.pricePerSft,
            location: {
              city: asset.city,
              state: asset.state,
              country: asset.country,
            },
          }
        : null,
    };
  });

  return {
    message: 'Orders fetched successfully',
    orders: formattedOrders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


  /**
   * Get single order by ID
   */
async findById(orderId: string): Promise<any> {
  const order = await this.orderModel.findById(orderId).lean();
  if (!order) throw new NotFoundException('Order not found');

  const asset = await this.assetModel.findById(order.assetId).lean();
  if (!asset) throw new NotFoundException('Asset not found');

  const assetDetailsForOrder = {
    _id: asset._id,
    name: asset.name,
    currency: asset.currency,
    pricePerSft: asset.pricePerSft,
    totalNumberOfSfts: asset.totalNumberOfSfts,
    location: {
      city: asset.city,
      state: asset.state,
      country: asset.country,
    },
  };

  return {
    message: 'Order fetched successfully',
    order: {
      ...order,
      asset: assetDetailsForOrder,
    },
  };
}
}
