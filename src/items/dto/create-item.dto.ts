import { ItemStatus } from './../entities/item.entity';
import {
  IsString,
  IsNumberString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { Column } from 'typeorm';
export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({ required: false })
  barcode: string;

  @IsNumberString()
  @ApiProperty({
    required: false,
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty()
  importPrice: number;

  @IsNumberString()
  @ApiProperty({
    required: false,
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty()
  price: number;

  @IsNumberString()
  @ApiProperty({
    required: false,
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty()
  weight: number;

  // @IsString()
  // @IsNotEmpty()
  // @ApiProperty({
  //   type: 'array',
  //   items: {
  //     type: 'string',
  //     format: 'binary',
  //   },
  // })
  // avatar: string;

  @IsNumberString()
  @ApiProperty({
    required: false,
    type: 'integer',
  })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  description: string;

  @IsEnum(ItemStatus)
  @ApiProperty({
    required: false,
    enum: ItemStatus,
  })
  @IsOptional()
  status: ItemStatus;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  itemAvatar: Express.Multer.File;
}
