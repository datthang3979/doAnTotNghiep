import { Voucher, VoucherType } from './entities/voucher.entity';
import { VouchersRepository } from './vouchers.repository';
import { Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
@Injectable()
export class VouchersService {
  constructor(private vouchersRepository: VouchersRepository) {}
  async create(createVoucherDto: CreateVoucherDto) {
    try {
      const voucher = await this.vouchersRepository.create({
        ...createVoucherDto,
      });
      return this.vouchersRepository.save(voucher);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findAll() {
    try {
      return await this.vouchersRepository.find();
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async findOne(id: string) {
    try {
      return await this.vouchersRepository.findOne({ id });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto) {
    try {
      const voucher = await this.findOne(id);
      return await this.vouchersRepository.save({
        ...voucher,
        ...updateVoucherDto,
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove(id: string) {
    const result = await this.vouchersRepository.delete({ id });
    if (result) return `Delete voucher with id: ${id}`;
    else {
      throw new NotFoundException();
    }
  }
  async findVoucherByCode(code: string) {
    const voucher = await this.vouchersRepository.findOne({ code });

    return voucher;
  }

  async applyVoucher(
    voucher: Voucher,
    itemsPrice: number,
    shippingPrice: number,
  ) {
    if (itemsPrice <= voucher.min) {
      throw new BadRequestException('Voucher is invalid.');
    }

    if (voucher.type === VoucherType.Shipping) {
      const decrease = voucher.discount * shippingPrice;
      shippingPrice =
        decrease > voucher.max
          ? shippingPrice - voucher.max
          : shippingPrice - decrease;
    }

    if (voucher.type == VoucherType.Discount) {
      const discount = voucher.discount * itemsPrice;
      itemsPrice =
        discount > voucher.max
          ? itemsPrice - voucher.max
          : itemsPrice - discount;
    }
    await this.vouchersRepository.save({
      ...voucher,
      quantity: voucher.quantity - 1,
    });
    return { itemsPrice, shippingPrice };
  }
}
