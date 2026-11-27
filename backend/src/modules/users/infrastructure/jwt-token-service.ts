import jwt from 'jsonwebtoken';
import { config } from '../../../shared/config';
import { TokenService } from '../../users/domain/token-service';

export class JwtTokenService implements TokenService {
  sign(userId: number): string {
    return jwt.sign({ sub: String(userId) }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  verify(token: string): number | null {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      if (typeof payload !== 'object' || payload.sub === undefined) {
        return null;
      }
      const userId = Number(payload.sub);
      return Number.isInteger(userId) ? userId : null;
    } catch {
      return null;
    }
  }
}