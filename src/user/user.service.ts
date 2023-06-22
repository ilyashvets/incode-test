import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'entities/user.entity';
import { Not, Repository } from 'typeorm';
import { TokenPayload } from 'shared/interface';
import { Role } from 'shared/enum';
import {
  ChangeBossRequestDto,
  SetRoleRequestDto,
  SetSubordinateRequestDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async setRole({ userId, role }: SetRoleRequestDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('User not found');
    if (user.role) throw new BadRequestException('User already has role');

    await this.userRepo.save({
      ...user,
      role,
    });
  }

  async setSubordinate({
    bossId,
    subordinateId,
  }: SetSubordinateRequestDto): Promise<void> {
    const [boss, subordinate] = await Promise.all([
      this.userRepo.findOne({
        where: { id: bossId, role: Role.Boss },
      }),
      this.userRepo.findOne({
        where: { id: subordinateId, role: Role.User },
        relations: ['boss'],
      }),
    ]);

    if (!boss) throw new BadRequestException('Boss not found');
    if (!subordinate) throw new BadRequestException('Subordinate not found');
    if (subordinate.boss)
      throw new BadRequestException('The subordinate already has a boss');

    await this.userRepo.save({
      ...subordinate,
      boss,
    });
  }

  async getUsers(initiator: TokenPayload): Promise<UserEntity[] | UserEntity> {
    if (initiator.role === Role.Admin) {
      return this.userRepo.find({
        where: { role: Not(Role.Admin) },
        order: {
          role: 'ASC',
        },
      });
    }
    if (initiator.role === Role.Boss) {
      const boss = await this.userRepo.findOne({
        where: { id: initiator.id },
        relations: ['subordinates'],
      });
      return this.getSubordinates(boss);
    }
    return this.userRepo.findOne({
      where: { id: initiator.id },
    });
  }

  private async getSubordinates(user: UserEntity): Promise<UserEntity> {
    if (!user.subordinates.length) return user;
    const userSubordinates = await this.userRepo.find({
      where: { boss: { id: user.id } },
      relations: ['subordinates'],
    });

    const subordinates = await Promise.all(
      userSubordinates.map((sub) => this.getSubordinates(sub)),
    );

    return Object.assign(user, { subordinates });
  }

  async changeBoss(
    initiator: TokenPayload,
    { bossId, subordinateId }: ChangeBossRequestDto,
  ): Promise<void> {
    const [oldBoss, newBoss] = await Promise.all([
      this.userRepo.findOne({
        where: { id: initiator.id, role: Role.Boss },
        relations: ['subordinates'],
      }),
      this.userRepo.findOne({
        where: { id: bossId, role: Role.Boss },
        relations: ['subordinates'],
      }),
    ]);

    if (!oldBoss || !newBoss) throw new BadRequestException('Boss not found');

    const existSubordinate = oldBoss.subordinates.find(
      (subordinate) => subordinate.id === subordinateId,
    );
    if (!existSubordinate)
      throw new ForbiddenException('This is not your subordinate');

    await this.userRepo.save({
      ...existSubordinate,
      boss: newBoss,
    });
  }
}
