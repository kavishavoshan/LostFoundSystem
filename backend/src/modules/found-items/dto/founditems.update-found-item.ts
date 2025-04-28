import { PartialType } from '@nestjs/mapped-types';
import { CreateFoundItemDto } from './founditems.create-found-items';

export class UpdateFoundItemDto extends PartialType(CreateFoundItemDto) {}