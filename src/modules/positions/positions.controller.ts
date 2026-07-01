import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('positions')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  private checkCompanyId(user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('User is not associated with any company');
    }
    return user.companyId;
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() createDto: CreatePositionDto, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.positionsService.create(createDto, companyId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findAll(@CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.positionsService.findAll(companyId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.positionsService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePositionDto,
    @CurrentUser() user: any,
  ) {
    const companyId = this.checkCompanyId(user);
    return this.positionsService.update(id, updateDto, companyId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.positionsService.remove(id, companyId);
  }
}
