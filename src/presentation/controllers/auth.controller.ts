import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthService } from '../../application/services/auth.service';
import { IAuditService } from '../../application/services/audit.service';
import { IJobQueue } from '../../infrastructure/queue/queue.interface';
import { catchAsync } from '../../shared/utils/catch-async.util';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class AuthController {
  constructor(
    @inject('IAuthService') private authService: IAuthService,
    @inject('IJobQueue') private jobQueue: IJobQueue,
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  public register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const user = await this.authService.register({ name, email, password });

    // Dispatch a background job to send a welcome email
    await this.jobQueue.addJob('email', 'sendWelcomeEmail', {
      to: user.email,
      subject: 'Welcome to Health Blog!',
      text: `Hi ${user.name},\n\nWelcome to our platform. We are excited to have you.`,
      html: `<b>Hi ${user.name},</b><br><br>Welcome to our platform. We are excited to have you.`,
    });

    // Create an audit log
    await this.auditService.log({
      actionType: 'USER_REGISTER',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
      newValues: { email: user.email, name: user.name },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    ResponseUtil.sendSuccess(res, 'User registered successfully. Please check your email.', { user });
  });

  public login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, token } = await this.authService.login(email, password);

    await this.auditService.log({
        actionType: 'USER_LOGIN_SUCCESS',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    ResponseUtil.sendSuccess(res, 'Login successful', { user, token });
  });
}
