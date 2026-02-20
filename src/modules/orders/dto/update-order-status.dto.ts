import { IsEnum } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status: OrderStatus;
}