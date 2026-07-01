import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: number, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.companyId !== id) {
      throw new ForbiddenException('Access denied to this company data');
    }

    const company = await this.prisma.company.findUnique({
      where: { id, isActive: true },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: number, updateDto: UpdateCompanyDto, currentUser: any) {
    await this.findOne(id, currentUser);
    return this.prisma.company.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
