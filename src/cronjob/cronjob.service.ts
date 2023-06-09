import { ItemFlashsalesService } from './../item-flashsales/item-flashsales.service';
import { FlashsalesService } from './../flashsales/flashsales.service';
import { ItemsService } from './../items/items.service';
import { getConnection } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ItemFlashsale } from 'src/item-flashsales/entities/item-flashsale.entity';
@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);
  constructor(
    private itemsService: ItemsService,
    private flashsalesService: FlashsalesService,
    private itemFlashsalesService: ItemFlashsalesService,
  ) {}

  @Cron('0 */1 * * *', {
    name: 'checkIsSaleItems',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async checkIsSaleItems() {
    const items = await this.itemsService.findAll();
    const timeNow = new Date();
    for (let index = 0; index < items.length; index++) {
      const itemId = items[index].id;

      const query = await getConnection()
        .createQueryBuilder()
        .select('item')
        .addSelect('item_flashsale')
        .addSelect('flashsale')
        .addSelect('item.price', 'price')
        .addSelect('item.price*(1-item_flashsale.discount)', 'realPrice')
        .from(ItemFlashsale, 'item_flashsale')
        .leftJoin('item_flashsale.item', 'item')
        .innerJoin('item_flashsale.flashsale', 'flashsale')
        .where('item.id = :id', { id: itemId })
        .andWhere('flashsale.startSale < :timeNow', { timeNow })
        .andWhere('flashsale.endSale > :timeNow', { timeNow })
        .orderBy('item_flashsale.discount', 'DESC')
        .limit(1)
        .execute();

      if (query[0]) {
        await this.itemsService.updateIsSaleTrue(itemId);
      } else {
        await this.itemsService.updateIsSaleFalse(itemId);
      }
    }
  }

  @Cron(' */20 * * * *', {
    name: 'updateQuantityAfterFlashsale',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async updateQuantityAfterFlashsale() {
    const now = new Date();

    const last20Minutes = new Date();
    last20Minutes.setMinutes(last20Minutes.getMinutes() - 20);

    const endedFlashsales = await getConnection()
      .createQueryBuilder()
      .select('item_flashsale.itemId', 'itemId')
      .addSelect('item_flashsale.quantity', 'quantity')
      .addSelect('item_flashsale.id', 'item_flashsale_id')
      .from(ItemFlashsale, 'item_flashsale')
      .innerJoin('item_flashsale.flashsale', 'flashsale')
      .where('flashsale.endSale < :now', { now })
      .andWhere('flashsale.endSale > :last20Minutes', { last20Minutes })
      .andWhere('item_flashsale.quantity != 0')
      .execute();

    endedFlashsales.forEach(async (element) => {
      await this.itemsService.updateQuantityAfterFlashsale(
        element.itemId,
        element.quantity,
      );
      await this.itemFlashsalesService.update(element.item_flashsale_id, {
        quantity: 0,
      });
    });
  }
}
