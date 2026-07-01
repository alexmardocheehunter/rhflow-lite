import { Controller, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('calendar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  private checkCompanyId(user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('User is not associated with any company');
    }
    return user.companyId;
  }

  @Get('weekly-presence')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  getWeeklyPresence(
    @CurrentUser() user: any,
    @Query('siteId') siteId?: string,
    @Query('positionId') positionId?: string,
  ) {
    const companyId = this.checkCompanyId(user);
    return this.calendarService.getWeeklyPresence(
      companyId,
      siteId ? parseInt(siteId) : undefined,
      positionId ? parseInt(positionId) : undefined,
    );
  }

  @Get('events')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  getEvents(
    @CurrentUser() user: any,
    @Query('siteId') siteId?: string,
    @Query('positionId') positionId?: string,
  ) {
    const companyId = this.checkCompanyId(user);
    return this.calendarService.getEvents(
      companyId,
      siteId ? parseInt(siteId) : undefined,
      positionId ? parseInt(positionId) : undefined,
    );
  }
}
