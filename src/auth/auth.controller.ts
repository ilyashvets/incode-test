import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public, Roles } from 'shared/decorator';
import { AuthService } from './auth.service';
import { SignInRequestDto, SignUpRequestDto } from './dto';
import { Role } from '../shared/enum';

@Controller('auth')
export class AuthController {
  private readonly COOKIE_TTL: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.COOKIE_TTL = this.configService.get('COOKIE_TTL');
  }

  @Post('sign-in')
  @Public()
  async login(
    @Res() res: Response,
    @Body() body: SignInRequestDto,
  ): Promise<void> {
    const accessToken = await this.authService.login(body);
    this.setCookie(res, accessToken);
    res.sendStatus(200);
  }

  @Post('sign-up')
  @Public()
  async register(@Body() body: SignUpRequestDto): Promise<string> {
    await this.authService.register(body);
    return 'ok';
  }

  @Get('sign-out')
  @Roles(Role.Admin, Role.Boss, Role.User)
  logout(@Res() res: Response): void {
    res.clearCookie('monkey');
    res.sendStatus(200);
  }

  private setCookie(res: Response, accessToken: string) {
    res.cookie('monkey', accessToken, {
      maxAge: this.COOKIE_TTL,
      sameSite: 'none',
      path: '/',
      httpOnly: true,
      secure: false, // true in production
    });
  }
}
