import { Role } from 'shared/enum';

export interface AuthHeaders extends Headers {
  cookie: string;
}

export interface AuthRequest extends Request {
  user: TokenPayload;
  headers: AuthHeaders;
}

export interface TokenPayload {
  id: number;
  role: Role;
}
