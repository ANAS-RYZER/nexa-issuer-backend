import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './order.service';
import { OrdersController } from './order.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Asset, AssetSchema } from '../real-estate/schema/asset.model';
import { ExchangeRateModule } from '../exchangeRate/exchange-rate.module'; 
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    ExchangeRateModule,
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], 
})
export class OrdersModule {}
