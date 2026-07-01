import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { LeaveTypesService } from './leave-types.service';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('leave-types')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class LeaveTypesController {
  constructor(private readonly leaveTypesService: LeaveTypesService) {}

  private checkCompanyId(user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('User is not associated with any company');
    }
    return user.companyId;
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() createDto: CreateLeaveTypeDto, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.leaveTypesService.create(createDto, companyId);
  }

  @Post('seed-defaults')
  @Roles('SUPER_ADMIN', 'ADMIN')
  seedDefaults(@CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.leaveTypesService.seedDefaults(companyId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE')
  findAll(@CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.leaveTypesService.findAll(companyId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.leaveTypesService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLeaveTypeDto,
    @CurrentUser() user: any,
  ) {
    const companyId = this.checkCompanyId(user);
    return this.leaveTypesService.update(id, updateDto, companyId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.leaveTypesService.remove(id, companyId);
  }
}
