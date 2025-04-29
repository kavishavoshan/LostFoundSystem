import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { User, UserSchema } from '../user/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
