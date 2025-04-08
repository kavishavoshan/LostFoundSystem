import { PartialType } from '@nestjs/mapped-types';
import { CreateLostItemDto } from './lostitems.create-lost-items';

export class UpdateLostItemDto extends PartialType(CreateLostItemDto) {}