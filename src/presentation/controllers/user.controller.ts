import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IUserService } from '../../application/services/user.service';
import { IAuditService } from '../../application/services/audit.service';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class UserController {
  constructor(
    @inject('IUserService') private userService: IUserService,
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.findById(req.params.id);
      ResponseUtil.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await this.userService.findMany(query);
      ResponseUtil.success(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const oldUser = await this.userService.findById(userId);
      const updatedUser = await this.userService.update(userId, req.body);

      // Log audit
      await this.auditService.log({
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: userId,
        oldValues: oldUser,
        newValues: updatedUser,
        userId: req.user.id,
      });

      ResponseUtil.success(res, updatedUser, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userService.findById(userId);
      await this.userService.delete(userId);

      // Log audit
      await this.auditService.log({
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: userId,
        oldValues: user,
        userId: req.user.id,
      });

      ResponseUtil.noContent(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}