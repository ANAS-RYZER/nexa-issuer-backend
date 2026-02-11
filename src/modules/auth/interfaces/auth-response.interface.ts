import { UserDocument } from '../../users/schemas/user.schema';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: UserDocument;
  isNewUser: boolean;
}

