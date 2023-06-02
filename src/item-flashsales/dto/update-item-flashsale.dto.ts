import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, IsOptional } from 'class-validator';

export class UpdateItemFlashsaleDto {
  @IsNumber()
  // @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  discount?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  @IsInt()
  quantity?: number;
}
