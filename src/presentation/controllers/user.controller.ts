import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuditService } from '../../application/services/audit.service';
import { IUserService } from '../../application/services/user.service';
import { ResponseUtil } from '../../shared/utils/response.util';
import { BadRequestError } from '../../shared/errors/bad-request.error';

@injectable()
export class UserController {
  constructor(
    @inject('IUserService') private userService: IUserService,
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  public findById = async (req: Request, res: Response): Promise<void> => {
      if (!req.params.id) {
        throw new BadRequestError("User ID is required.");
      }
      const user = await this.userService.findById(req.params.id);
      ResponseUtil.success(res, user, 'User retrieved successfully');
  }

  public findMany = async (req: Request, res: Response): Promise<void> => {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await this.userService.findMany(query);
      ResponseUtil.paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
  }

  public update = async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id;
      if (!userId) {
        throw new BadRequestError("User ID is required.");
      }
      const oldUser = await this.userService.findById(userId);
      const updatedUser = await this.userService.update(userId, req.body);

      // Log audit
      await this.auditService.log({
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: userId,
        oldValues: oldUser,
        newValues: updatedUser,
        userId: req.user.id, // Assuming user is attached to request by auth middleware
        timestamp: new Date(),
        id: ''
      });

      ResponseUtil.success(res, updatedUser, 'User updated successfully');
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id;
      if (!userId) {
        throw new BadRequestError("User ID is required.");
      }
      const user = await this.userService.findById(userId);
      await this.userService.delete(userId);

      // Log audit
      await this.auditService.log({
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: userId,
        oldValues: user,
        userId: req.user.id, // Assuming user is attached to request by auth middleware
        timestamp: new Date(),
        id: ''
      });

      ResponseUtil.noContent(res, 'User deleted successfully');
  }
}
