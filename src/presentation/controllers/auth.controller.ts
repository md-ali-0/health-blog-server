import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IAuthService } from '../../application/services/auth.service';
import { IAuditService } from '../../application/services/audit.service';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class AuthController {
  constructor(
    @inject('IAuthService') private authService: IAuthService,
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.register(req.body);
      
      // Log audit
      await this.auditService.log({
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: result.user.id,
        newValues: { email: result.user.email, username: result.user.username },
        userId: result.user.id,
      });

      ResponseUtil.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.login(req.body);
      
      // Log audit
      await this.auditService.log({
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: result.user.id,
        userId: result.user.id,
      });

      ResponseUtil.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Log audit
      await this.auditService.log({
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: req.user.id,
        userId: req.user.id,
      });

      ResponseUtil.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password: _, ...userWithoutPassword } = req.user;
      ResponseUtil.success(res, userWithoutPassword, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}