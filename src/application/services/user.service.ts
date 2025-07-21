import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User, UpdateUserData } from '../../domain/entities/user.entity';
import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { ConflictError } from '../../shared/errors/conflict.error';

export interface IUserService {
  findById(id: string): Promise<Omit<User, 'password'>>;
  findMany(query: PaginationQuery): Promise<PaginationResult<Omit<User, 'password'>>>;
  update(id: string, data: UpdateUserData): Promise<Omit<User, 'password'>>;
  delete(id: string): Promise<void>;
}

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findMany(query: PaginationQuery): Promise<PaginationResult<Omit<User, 'password'>>> {
    const result = await this.userRepository.findMany(query);
    
    return {
      ...result,
      data: result.data.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
    };
  }

  async update(id: string, data: UpdateUserData): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User', id);
    }

    // Check username uniqueness if updating username
    if (data.username && data.username !== existingUser.username) {
      const userWithUsername = await this.userRepository.findByUsername(data.username);
      if (userWithUsername) {
        throw new ConflictError('Username already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    await this.userRepository.delete(id);
  }
}
