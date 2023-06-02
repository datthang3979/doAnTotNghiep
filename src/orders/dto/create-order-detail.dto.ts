import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
export class CreateOrderDetailDto {
  @IsString()
  @ApiProperty()
  itemId: string;

  @IsString()
  @ApiProperty()
  orderId: string;

  @IsNumber()
  @ApiProperty({ type: 'number', format: 'int' })
  quantity: number;
}
