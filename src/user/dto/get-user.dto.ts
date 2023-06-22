import { UserEntity } from 'entities/user.entity';
import { Role } from 'shared/enum';

export class GetUserResponseDto {
  constructor(user: UserEntity) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
    this.subordinates = user.subordinates.map(
      (sub) => new GetUserResponseDto(sub),
    );
  }

  id: number;

  email: string;

  role: Role;

  subordinates: GetUserResponseDto[];
}
