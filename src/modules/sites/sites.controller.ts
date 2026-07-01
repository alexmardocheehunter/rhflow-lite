import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('sites')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  private checkCompanyId(user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('User is not associated with any company');
    }
    return user.companyId;
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() createSiteDto: CreateSiteDto, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.sitesService.create(createSiteDto, companyId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findAll(@CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.sitesService.findAll(companyId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.sitesService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSiteDto: UpdateSiteDto,
    @CurrentUser() user: any,
  ) {
    const companyId = this.checkCompanyId(user);
    return this.sitesService.update(id, updateSiteDto, companyId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const companyId = this.checkCompanyId(user);
    return this.sitesService.remove(id, companyId);
  }
}
