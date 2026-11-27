import type { NewUser, User } from './user';

export interface UserRepository {
  create(newUser: NewUser): User;
  findByEmail(email: string): User | null;
  findById(id: number): User | null;
}
