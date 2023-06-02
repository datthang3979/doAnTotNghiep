import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';
// import { ApiProperty}
export class CreateFlashsaleDto {
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  startSale: Date;

  @ApiProperty()
  @IsDateString()
  endSale: Date;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  flashSaleBanner: Express.Multer.File[];
}
