import { PartialType } from '@nestjs/mapped-types';
import { CreateFoundItemDto } from './create-found-item.dto';
import { Transform } from 'class-transformer';

export class UpdateFoundItemDto extends PartialType(CreateFoundItemDto) {
    @Transform(({ value }) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        }
        return value;
      })
      clip_vector?: number[];
} 