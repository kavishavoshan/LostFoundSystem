import { PartialType } from '@nestjs/mapped-types';
import { CreateLostItemDto } from './create-lost-item.dto';
import { Transform } from 'class-transformer';

export class UpdateLostItemDto extends PartialType(CreateLostItemDto) {
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