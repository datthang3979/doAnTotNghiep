import { IsString, IsNumberString, IsNotEmpty } from 'class-validator';
export class CreateCategoryBannerDto {
  @IsNumberString()
  @IsNotEmpty()
  position: number;

  @IsString()
  url: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
