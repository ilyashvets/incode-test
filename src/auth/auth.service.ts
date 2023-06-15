import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { SignInRequestDto, SignUpRequestDto } from './dto';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {
    this.JWT_SECRET = configService.get('JWT_SECRET');
  }

  async login({ email, password }: SignInRequestDto): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) throw new BadRequestException('User with this email not found');
    if (!user.role)
      throw new ForbiddenException(
        'Contact your administrator to provide a role',
      );

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      throw new BadRequestException('Incorrect credentials');

    return this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
      },
      {
        secret: this.JWT_SECRET,
      },
    );
  }

  async register({ email, password }: SignUpRequestDto): Promise<void> {
    const existUser = await this.userRepo.findOne({ where: { email } });
    if (existUser)
      throw new BadRequestException('User with this email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepo.save({
      email,
      password: hashedPassword,
    });
  }
}
