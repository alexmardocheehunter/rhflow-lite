import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';

@Injectable()
export class LeaveTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateLeaveTypeDto, companyId: number) {
    return this.prisma.leaveType.create({
      data: {
        ...createDto,
        companyId,
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.leaveType.findMany({
      where: { companyId, isActive: true },
    });
  }

  async findOne(id: number, companyId: number) {
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, companyId, isActive: true },
    });
    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${id} not found under this company`);
    }
    return leaveType;
  }

  async update(id: number, updateDto: UpdateLeaveTypeDto, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.leaveType.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.leaveType.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async seedDefaults(companyId: number) {
    const defaults = ['Congé annuel', 'Maladie', 'Permission', 'Exceptionnel'];
    const creations = defaults.map(name =>
      this.prisma.leaveType.create({
        data: { name, companyId },
      }),
    );
    return Promise.all(creations);
  }
}
