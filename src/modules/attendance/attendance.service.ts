import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAttendanceDto, employeeId: number, companyId: number) {
    // 1. Verify site belongs to the same company
    const site = await this.prisma.site.findFirst({
      where: { id: createDto.siteId, companyId, isActive: true },
    });
    if (!site) {
      throw new NotFoundException(`Site with ID ${createDto.siteId} not found under this company`);
    }

    // 2. Anti-fraud check: calculate distance between employee coordinates and site coordinates (if both are provided)
    if (createDto.latitude && createDto.longitude && site.latitude && site.longitude) {
      const distance = this.calculateDistance(
        createDto.latitude,
        createDto.longitude,
        site.latitude,
        site.longitude,
      );

      // Max allowed distance: 200 meters (0.2 km)
      if (distance > 0.2) {
        throw new BadRequestException('Vous devez être présent sur le site physique pour pointer.');
      }
    }

    return this.prisma.attendance.create({
      data: {
        ...createDto,
        employeeId,
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.attendance.findMany({
      where: {
        employee: { companyId },
      },
      include: {
        employee: true,
        site: true,
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findByEmployee(employeeId: number) {
    return this.prisma.attendance.findMany({
      where: { employeeId },
      include: { site: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
