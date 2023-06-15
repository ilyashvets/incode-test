import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { AuthRequest } from 'shared/interface';
import { UserService } from './user.service';
import {
  ChangeBossRequestDto,
  GetUserResponseDto,
  SetRoleRequestDto,
  SetSubordinateRequestDto,
} from './dto';
import { Role } from '../shared/enum';
import { Roles } from '../shared/decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('role')
  @Roles(Role.Admin)
  async setRole(@Body() body: SetRoleRequestDto): Promise<string> {
    await this.userService.setRole(body);
    return 'ok';
  }

  @Post('subordinate')
  @Roles(Role.Admin)
  async setSubordinate(
    @Body() body: SetSubordinateRequestDto,
  ): Promise<string> {
    await this.userService.setSubordinate(body);
    return 'ok';
  }

  @Get()
  @Roles(Role.Admin, Role.Boss, Role.User)
  async getUsers(
    @Req() req: AuthRequest,
  ): Promise<GetUserResponseDto[] | GetUserResponseDto> {
    const users = await this.userService.getUsers(req.user);
    const response = users.map((user) => new GetUserResponseDto(user));
    return req.user.role === Role.User ? response[0] : response;
  }

  @Post('change-boss')
  @HttpCode(200)
  @Roles(Role.Boss)
  async changeBoss(
    @Req() req: AuthRequest,
    @Body() body: ChangeBossRequestDto,
  ): Promise<string> {
    await this.userService.changeBoss(req.user, body);
    return 'ok';
  }
}
