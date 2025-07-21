export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  READER = 'READER',
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role?: Role;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: Role;
  isActive?: boolean;
}
