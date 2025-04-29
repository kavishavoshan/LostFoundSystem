import { PartialType } from '@nestjs/mapped-types';
import { CreateFoundItemDto } from './create-found-item.dto';

export class UpdateFoundItemDto extends PartialType(CreateFoundItemDto) {} 