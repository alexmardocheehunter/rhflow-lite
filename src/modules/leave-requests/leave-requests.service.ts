import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaveRequestDto, ValidateLeaveRequestDto } from './dto/leave-request.dto';
import { Role } from '@prisma/client';

@Injectable()
export class LeaveRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateLeaveRequestDto, employeeId: number, companyId: number) {
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id: createDto.leaveTypeId, companyId, isActive: true },
    });
    if (!leaveType) {
      throw new NotFoundException(`Leave Type with ID ${createDto.leaveTypeId} not found`);
    }

    const start = new Date(createDto.startDate);
    const end = new Date(createDto.endDate);

    if (start >= end) {
      throw new BadRequestException('La date de début doit être antérieure à la date de fin.');
    }

    return this.prisma.leaveRequest.create({
      data: {
        ...createDto,
        startDate: start,
        endDate: end,
        employeeId,
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.leaveRequest.findMany({
      where: {
        employee: { companyId },
        isActive: true,
      },
      include: {
        employee: {
          include: { site: true, position: true },
        },
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyRequests(employeeId: number) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId, isActive: true },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, companyId: number) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id, employee: { companyId }, isActive: true },
      include: { employee: true, leaveType: true },
    });
    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    return request;
  }

  async validate(id: number, validateDto: ValidateLeaveRequestDto, currentUser: any) {
    const request = await this.findOne(id, currentUser.companyId);
    const now = new Date();

    if (currentUser.role === Role.MANAGER) {
      if (request.status !== 'PENDING_MANAGER') {
        throw new BadRequestException('Cette demande a déjà été traitée ou requiert la validation de l\'administrateur.');
      }
      return this.prisma.leaveRequest.update({
        where: { id },
        data: {
          status: validateDto.status, 
          managerId: currentUser.employeeId,
          managerValidatedAt: now,
        },
      });
    }

    if (currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN) {
      return this.prisma.leaveRequest.update({
        where: { id },
        data: {
          status: validateDto.status, 
          adminId: currentUser.employeeId || null,
          adminValidatedAt: now,
        },
      });
    }

    throw new ForbiddenException('Vous n\'avez pas les permissions requises pour valider cette demande.');
  }
}
