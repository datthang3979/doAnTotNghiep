import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateItemDto extends PartialType(CreateItemDto) {}
