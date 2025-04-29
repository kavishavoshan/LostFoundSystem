import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}