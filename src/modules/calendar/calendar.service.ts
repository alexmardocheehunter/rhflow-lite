import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyPresence(companyId: number, siteId?: number, positionId?: number) {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
        ...(siteId ? { siteId } : {}),
        ...(positionId ? { positionId } : {}),
      },
      include: {
        attendances: {
          where: {
            timestamp: {
              gte: monday,
              lte: sunday,
            },
          },
          include: { site: true },
        },
      },
    });

    return employees.map(emp => {
      const weeklyPunches = emp.attendances.reduce((acc, att) => {
        const dayIndex = (new Date(att.timestamp).getDay() + 6) % 7; 
        if (!acc[dayIndex]) acc[dayIndex] = [];
        acc[dayIndex].push({
          type: att.type,
          time: att.timestamp,
          site: att.site.name,
        });
        return acc;
      }, {});

      return {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        matricule: emp.matricule,
        punches: weeklyPunches,
      };
    });
  }

  async getEvents(companyId: number, siteId?: number, positionId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfToday = today;
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        employee: {
          companyId,
          isActive: true,
          ...(siteId ? { siteId } : {}),
          ...(positionId ? { positionId } : {}),
        },
        timestamp: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        employee: true,
        site: true,
      },
    });

    const leavesToday = await this.prisma.leaveRequest.findMany({
      where: {
        employee: {
          companyId,
          isActive: true,
          ...(siteId ? { siteId } : {}),
          ...(positionId ? { positionId } : {}),
        },
        status: 'APPROVED',
        startDate: { lte: endOfToday },
        endDate: { gte: startOfToday },
        isActive: true,
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    const upcomingLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        employee: {
          companyId,
          isActive: true,
          ...(siteId ? { siteId } : {}),
          ...(positionId ? { positionId } : {}),
        },
        status: 'APPROVED',
        startDate: {
          gt: endOfToday,
          lte: in7Days,
        },
        isActive: true,
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    return {
      activePunchesToday: attendances.map(att => ({
        employeeId: att.employeeId,
        employeeName: `${att.employee.firstName} ${att.employee.lastName}`,
        type: att.type,
        time: att.timestamp,
        site: att.site.name,
      })),
      absentOrOnLeaveToday: leavesToday.map(leave => ({
        employeeId: leave.employeeId,
        employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
        leaveType: leave.leaveType.name,
        startDate: leave.startDate,
        endDate: leave.endDate,
      })),
      upcomingLeaves: upcomingLeaves.map(leave => ({
        employeeId: leave.employeeId,
        employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
        leaveType: leave.leaveType.name,
        startDate: leave.startDate,
        endDate: leave.endDate,
      })),
    };
  }
}
