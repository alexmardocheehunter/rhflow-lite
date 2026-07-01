import { Controller, Get, Post, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('attendance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('punch')
  @Roles('EMPLOYEE', 'MANAGER', 'ADMIN')
  create(@Body() createDto: CreateAttendanceDto, @CurrentUser() user: any) {
    if (!user.employeeId) {
      throw new ForbiddenException('Seuls les profils rattachés à un employé peuvent pointer.');
    }
    return this.attendanceService.create(createDto, user.employeeId, user.companyId);
  }

  @Get('my-history')
  @Roles('EMPLOYEE', 'MANAGER', 'ADMIN')
  findMyHistory(@CurrentUser() user: any) {
    if (!user.employeeId) {
      throw new ForbiddenException('Aucun employé rattaché pour récupérer l\'historique.');
    }
    return this.attendanceService.findByEmployee(user.employeeId);
  }

  @Get('company-history')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findAll(@CurrentUser() user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('Utilisateur non rattaché à une entreprise.');
    }
    return this.attendanceService.findAll(user.companyId);
  }
}
