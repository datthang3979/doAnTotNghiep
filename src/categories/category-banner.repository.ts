import { CategoryBanner } from './entities/category-banner.entity';
import { EntityRepository, Repository } from 'typeorm';
// import { CreateCategoryBannerDto}
@EntityRepository(CategoryBanner)
export class CategoryBannerRepository extends Repository<CategoryBanner> {}
