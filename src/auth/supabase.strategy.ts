import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET || 'your-default-secret',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const email = payload.email;

    if (!userId) {
      throw new UnauthorizedException('Invalid Supabase token payload');
    }

    let profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: { company: true, employee: true },
    });

    if (!profile) {
      profile = await this.prisma.profile.create({
        data: {
          id: userId,
          email: email || '',
          role: 'EMPLOYEE',
        },
        include: { company: true, employee: true },
      });
    }

    return profile;
  }
}
