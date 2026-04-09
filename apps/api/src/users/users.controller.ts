import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getProfile(user.userId);
  }

  @Put('profile')
  upsertProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpsertProfileDto,
  ) {
    return this.usersService.upsertProfile(user.userId, dto);
  }
}
