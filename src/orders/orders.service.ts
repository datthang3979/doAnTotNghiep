/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { Item } from './../items/entities/item.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { OrderDetailsRepository } from './order-details.repository';
import { ItemFlashsalesService } from './../item-flashsales/item-flashsales.service';
import { ItemsService } from './../items/items.service';
import { OrderDetailsService } from './order-details.service';
import { Voucher } from './../vouchers/entities/voucher.entity';
import { OrderStatus } from './entities/order.entity';
import { VouchersService } from './../vouchers/vouchers.service';
import { UsersService } from './../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdersRepository } from './orders.repository';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { getManager, getConnection } from 'typeorm';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersRepository)
    private ordersRepository: OrdersRepository,
    @InjectRepository(OrderDetailsRepository)
    private orderDetailsRepository: OrderDetailsRepository,

    private usersService: UsersService,
    private vouchersService: VouchersService,
    private orderDetailsService: OrderDetailsService,
    private itemsService: ItemsService,
    private itemFlashsalesService: ItemFlashsalesService,
  ) {}
  /*{
  "userId": "0187d7e5-537c-4b0a-bc40-0ab554a9beb3",
  "voucherCode": "GIAM5K",
  "addressShipping": "Hanoi, Vietnam",
  "shippingPrice": 15,
  "items": [
    {
        "itemId": "81d18c6e-94d1-473a-999a-93ac4db9ff89",
        "quantity": 1
    }
  ]
}

   */
  async create(createOrderDto: CreateOrderDto) {
    let { voucherCode, userId, items, shippingPrice, addressShipping } =
      createOrderDto;

    //# get information
    let user = await this.usersService.findOne(userId);
    const voucher = voucherCode
      ? await this.vouchersService.findVoucherByCode(voucherCode)
      : null;

    //# check voucher
    if (user === undefined || voucher === undefined) {
      throw new NotFoundException('Can not find information.');
    }
    if (voucher.quantity == 0) {
      throw new BadRequestException('Voucher is invalid.');
    }
    const timeNow = new Date();
    if (voucher.startTime > timeNow || voucher.endTime < timeNow) {
      throw new BadRequestException('Voucher is invalid.');
    }

    //# create order => get constraint
    let order = await this.ordersRepository.save({ shippingPrice, status: OrderStatus.Waiting, user, addressShipping });
    
    //# calculate  order.itemsPrice
    let itemsPrice = 0;
    for (let index = 0; index < items.length; index++) {
      let item = await this.itemsService.findOne(items[index].itemId);
      
      
      
      //# check quantity for flashsale 
      if( item.isSale ) {
        const query = await this.itemsService.getItemWithFlashsale( items[index].itemId );
        this.checkQuantityForSale( items[index].quantity, query.item_flashsale_quantity, query.item_quantity );
        
        
        //# update quantity and calculate itemsPrice price
        //# and create order detail
        itemsPrice = await this.updateQuantityIsSaleAndCreateOrderDetail( query, item, items[index].quantity, itemsPrice, order );
      } else {
        
        this.checkQuantity( items[index].quantity, item.quantity );
        itemsPrice = await this.updateQuantityIsSaleAndCreateOrderDetail( null, item, items[index].quantity, itemsPrice, order );

      }
      
    }

    //# apply voucher
    if (voucher) {
      const { itemsPrice: newItemsPrice, shippingPrice: newShippingPrice } =
        await this.vouchersService.applyVoucher(
          voucher,
          itemsPrice,
          shippingPrice,
        );

      return await this.ordersRepository.save({
        ...order,
        voucher,
        shippingPrice: newShippingPrice,
        itemsPrice: newItemsPrice,
        total: newShippingPrice + newItemsPrice,
      });
    }
    return await this.ordersRepository.save({
      ...order,
      voucher: null,
      itemsPrice,
      total: shippingPrice + itemsPrice,
    });
  }

  checkQuantityForSale(
    quantity: number,
    item_flashsale_quantity: number,
    item_quantity: number,
  ) {
    if (
      item_flashsale_quantity != 0 &&
      (quantity > item_flashsale_quantity || quantity == 0)
    ) {
      throw new BadRequestException('Quantity is not good.');
    }
    if (quantity > item_quantity || quantity == 0) {
      throw new BadRequestException('Quantity is not good.');
    }
  }
  checkQuantity(quantity: number, itemQuantity: number) {
    if (quantity == 0  || quantity > itemQuantity) {
      throw new BadRequestException('Quantity is not good.');
    }
  }

  async updateQuantityIsSaleAndCreateOrderDetail(query, item, quantity, itemsPrice, order) {

    if(query == null) {
      
      const newItem = {
        quantity: item.quantity - quantity,
      };

      await this.itemsService.update(item.id, newItem, null);

      //# create order detail
      await this.createOrderDetail(item, order, null, quantity, item.price);
      
      return itemsPrice + item.price * quantity;
    }
    
    if (query && query.item_flashsale_quantity != 0) {
      const newItemFlashsale = {
        quantity: query.item_flashsale_quantity - quantity,
      };
      await this.itemFlashsalesService.update(
        query.item_flashsale_id,
        newItemFlashsale,
      );
      //# create order detail
      await this.createOrderDetail(item, order, query.item_flashsale_id, quantity, item.price);

      return itemsPrice + query.realPrice * quantity;
    } 
  }

  async createOrderDetail(item, order, iteamFlashsaleId, quantity, price) {
    
    const itemFlashsale = iteamFlashsaleId 
      ? await this.itemFlashsalesService.findOne(iteamFlashsaleId)
      : null;

    if (itemFlashsale == null) {
      let orderDetail = await this.orderDetailsRepository.create({
        item,
        order,
        quantity,
        price,
        itemFlashsale: null,
      });
      
      await this.orderDetailsRepository.save( orderDetail );
    } else {
      let orderDetail = await this.orderDetailsRepository.create({
        item,
        order,
        quantity,
        price,
        itemFlashsale,
      });
      await this.orderDetailsRepository.save( orderDetail );
    }
  }


  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: string) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
