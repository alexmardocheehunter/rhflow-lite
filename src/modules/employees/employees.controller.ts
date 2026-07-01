import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('employees')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  private checkCompanyId(user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('User is not associated with any company');
    }
    return user.companyId;
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() createDto: CreateEmployeeDto, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.employeesService.create(createDto, companyId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findAll(@CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.employeesService.findAll(companyId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.employeesService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmployeeDto,
    @CurrentUser() user: any,
  ) {
    const companyId = this.checkCompanyId(user);
    return this.employeesService.update(id, updateDto, companyId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.employeesService.remove(id, companyId);
  }
}
