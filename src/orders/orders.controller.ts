import { OrderDetailsService } from './order-details.service';
import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
@ApiTags('Order')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private orderDetailsService: OrderDetailsService,
  ) {}

  @Post()
  // @ApiConsumes('multipart/form-data')
  // @FormDataRequest()
  create(@Body() createOrderDto: CreateOrderDto) {
    try {
      return this.ordersService.create(createOrderDto);
    } catch (error) {
      throw new BadRequestException('Create order badly.');
    }
  }
  @Post('orderdetail')
  createOrderDetail(@Body() createOrderDetailDto: CreateOrderDetailDto) {
    return this.orderDetailsService.create(createOrderDetailDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.ordersService.findOne(id);
    } catch (error) {
      throw new NotFoundException('Can not find order.');
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
