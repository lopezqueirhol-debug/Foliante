export interface TokenService {
  sign(userId: number): string;
  verify(token: string): number | null;
}
