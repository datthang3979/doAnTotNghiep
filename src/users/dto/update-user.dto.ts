import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsMobilePhone,
  IsDate,
  IsOptional,
  IsArray,
} from 'class-validator';
// import { Type}
export class UpdateUserDto {
  @ApiProperty({
    description: 'name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'phone',
    required: false,
  })
  @IsOptional()
  @IsMobilePhone('vi-VN')
  phone?: string;

  @ApiProperty({
    description: 'birthday',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthday?: Date;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'address',
    required: false,
  })
  @IsArray()
  @IsOptional()
  address?: string[];
}
