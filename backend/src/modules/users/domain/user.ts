export interface User {
  readonly id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export type NewUser = Omit<User, 'id' | 'createdAt'>;
