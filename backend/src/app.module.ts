import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { AuthModule } from './modules/auth/auth.module';
import { LostItemsModule } from './modules/lost-items/lostitems.module';
import { MessagesModule } from './modules/messages/messages.module';
import { FoundItemsModule } from './modules/found-items/found-items.module';
import { NewsPageModule } from './modules/news/news-page.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Loads .env variables
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/lostfound', {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    UserModule,
    ProductModule,
    AuthModule,
    LostItemsModule,
    MessagesModule,
    FoundItemsModule,
    NewsPageModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}