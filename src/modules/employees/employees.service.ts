import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateEmployeeDto, companyId: number) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Count how many employees have been created in the current month in this company
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

    const count = await this.prisma.employee.count({
      where: {
        companyId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    const matricule = `EMP${year}${month}${sequence}`;

    return this.prisma.employee.create({
      data: {
        ...createDto,
        companyId,
        matricule,
        birthDate: createDto.birthDate ? new Date(createDto.birthDate) : null,
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.employee.findMany({
      where: { companyId, isActive: true },
      include: { site: true, position: true },
    });
  }

  async findOne(id: number, companyId: number) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId, isActive: true },
      include: { site: true, position: true },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found under this company`);
    }
    return employee;
  }

  async update(id: number, updateDto: UpdateEmployeeDto, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...updateDto,
        birthDate: updateDto.birthDate ? new Date(updateDto.birthDate) : undefined,
      },
    });
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.employee.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
