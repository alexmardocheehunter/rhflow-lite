import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateSiteDto, companyId: number) {
    return this.prisma.site.create({
      data: {
        ...createDto,
        companyId,
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.site.findMany({
      where: { companyId, isActive: true },
      include: { manager: true },
    });
  }

  async findOne(id: number, companyId: number) {
    const site = await this.prisma.site.findFirst({
      where: { id, companyId, isActive: true },
      include: { manager: true },
    });
    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found under this company`);
    }
    return site;
  }

  async update(id: number, updateDto: UpdateSiteDto, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.site.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.site.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
