import { User, CreateUserData, UpdateUserData } from '../entities/user.entity';
import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findMany(query: PaginationQuery): Promise<PaginationResult<User>>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
}