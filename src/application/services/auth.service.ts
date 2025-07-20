import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';
import { CreateUserData, User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { AuthError } from '../../shared/errors/auth.error';
import { ConflictError } from '../../shared/errors/conflict.error';
import { PasswordUtil } from '../../shared/utils/password.util';

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

export interface IAuthService {
  register(data: CreateUserData): Promise<AuthResult>;
  login(data: LoginData): Promise<AuthResult>;
  verifyToken(token: string): Promise<User>;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async register(data: CreateUserData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('User with this username already exists');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(data.password);

    // Create user
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(data: LoginData): Promise<AuthResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new AuthError('Invalid token');
      }

      return user;
    } catch (error) {
      throw new AuthError('Invalid token');
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}