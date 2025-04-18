import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LostItem, LostItemSchema } from '../lost-items/schemas/lost-item.schema';
import { FoundItem, FoundItemSchema } from '../found-items/schemas/found-item.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: LostItem.name, schema: LostItemSchema },
      { name: FoundItem.name, schema: FoundItemSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadDir = join(__dirname, '..', '..', '..', 'uploads');
          // Create directory if it doesn't exist
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          callback(null, uploadDir);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
