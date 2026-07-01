import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto, ValidateLeaveRequestDto } from './dto/leave-request.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('leave-requests')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  private checkCompanyId(user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('User is not associated with any company');
    }
    return user.companyId;
  }

  @Post()
  @Roles('EMPLOYEE', 'MANAGER', 'ADMIN')
  create(@Body() createDto: CreateLeaveRequestDto, @CurrentUser() user: any) {
    if (!user.employeeId) {
      throw new ForbiddenException('Seuls les profils rattachés à un employé peuvent soumettre des demandes.');
    }
    const companyId = this.checkCompanyId(user);
    return this.leaveRequestsService.create(createDto, user.employeeId, companyId);
  }

  @Get('my-requests')
  @Roles('EMPLOYEE', 'MANAGER', 'ADMIN')
  findMyRequests(@CurrentUser() user: any) {
    if (!user.employeeId) {
      throw new ForbiddenException('Aucun employé rattaché.');
    }
    return this.leaveRequestsService.findMyRequests(user.employeeId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findAll(@CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.leaveRequestsService.findAll(companyId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.leaveRequestsService.findOne(id, companyId);
  }

  @Patch(':id/validate')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  validate(
    @Param('id', ParseIntPipe) id: number,
    @Body() validateDto: ValidateLeaveRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.leaveRequestsService.validate(id, validateDto, user);
  }
}
