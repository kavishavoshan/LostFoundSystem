import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './modules/user/user.entity';
import { UserModule } from './modules/user/user.module';
import { Product } from './modules/product/product.entity';
import { ProductModule } from './modules/product/product.module';
import { AuthModule } from './modules/auth/auth.module';
import { LostItem } from './modules/lost-items/lostitems.entity';
import { LostItemModule } from './modules/lost-items/lostitems.module';
import { Message } from './modules/messages/message.entity';
import { MessagesModule } from './modules/messages/messages.module';
import { FoundItem } from './modules/found-items/found-items.entity';
import { FoundItemModule } from './modules/found-items/found-items.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Loads .env variables globally
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // Creates the database and tables automatically
      entities: [User, Product, LostItem, FoundItem, Message],
    }),
    TypeOrmModule.forFeature([User, LostItem]),
    UserModule,
    ProductModule,
    AuthModule,
    LostItemModule,
    MessagesModule,
    FoundItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}