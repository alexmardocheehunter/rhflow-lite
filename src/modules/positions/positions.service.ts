import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePositionDto, companyId: number) {
    return this.prisma.position.create({
      data: {
        ...createDto,
        companyId,
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.position.findMany({
      where: { companyId, isActive: true },
    });
  }

  async findOne(id: number, companyId: number) {
    const position = await this.prisma.position.findFirst({
      where: { id, companyId, isActive: true },
    });
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found under this company`);
    }
    return position;
  }

  async update(id: number, updateDto: UpdatePositionDto, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.position.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.position.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
