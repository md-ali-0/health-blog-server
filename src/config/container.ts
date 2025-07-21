import { Container } from 'inversify';
import { App } from '../app';

// Interfaces
import { ILogger } from '../shared/interfaces/logger.interface';
import { IDatabase } from '../infrastructure/database/database.interface';
import { ICache } from '../infrastructure/cache/cache.interface';
import { IEmailService } from '../infrastructure/email/email.interface';
import { IFileStorage } from '../infrastructure/storage/storage.interface';
import { IJobQueue } from '../infrastructure/queue/queue.interface';

// Repositories
import { IUserRepository } from '../domain/repositories/user.repository';
import { IPostRepository } from '../domain/repositories/post.repository';
import { ICommentRepository } from '../domain/repositories/comment.repository';
import { IAuditLogRepository } from '../domain/repositories/audit-log.repository';

// Services
import { IAuthService } from '../application/services/auth.service';
import { IUserService } from '../application/services/user.service';
import { IPostService } from '../application/services/post.service';
import { ICommentService } from '../application/services/comment.service';
import { IAuditService } from '../application/services/audit.service';

// Implementations
import { PinoLogger } from '../infrastructure/logging/pino-logger';
import { PrismaDatabase } from '../infrastructure/database/prisma-database';
import { RedisCache } from '../infrastructure/cache/redis-cache';
import { NodemailerEmailService } from '../infrastructure/email/nodemailer-email';
import { LocalFileStorage } from '../infrastructure/storage/local-storage';
import { BullMQQueue } from '../infrastructure/queue/bullmq-queue';

import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository';
import { PrismaPostRepository } from '../infrastructure/repositories/prisma-post.repository';
import { PrismaCommentRepository } from '../infrastructure/repositories/prisma-comment.repository';
import { PrismaAuditLogRepository } from '../infrastructure/repositories/prisma-audit-log.repository';

import { AuthService } from '../application/services/auth.service';
import { UserService } from '../application/services/user.service';
import { PostService } from '../application/services/post.service';
import { CommentService } from '../application/services/comment.service';
import { AuditService } from '../application/services/audit.service';

// Controllers
import { AuthController } from '../presentation/controllers/auth.controller';
import { UserController } from '../presentation/controllers/user.controller';
import { PostController } from '../presentation/controllers/post.controller';
import { CommentController } from '../presentation/controllers/comment.controller';
import { HealthController } from '../presentation/controllers/health.controller';
import { AuditController } from '../presentation/controllers/audit.controller';

const container = new Container();

// Bind App
container.bind<App>('App').to(App);

// Bind Infrastructure
container.bind<ILogger>('ILogger').to(PinoLogger).inSingletonScope();
container.bind<IDatabase>('IDatabase').to(PrismaDatabase).inSingletonScope();
container.bind<ICache>('ICache').to(RedisCache).inSingletonScope();
container.bind<IEmailService>('IEmailService').to(NodemailerEmailService).inSingletonScope();
container.bind<IFileStorage>('IFileStorage').to(LocalFileStorage).inSingletonScope();
container.bind<IJobQueue>('IJobQueue').to(BullMQQueue).inSingletonScope();

// Bind Repositories
container.bind<IUserRepository>('IUserRepository').to(PrismaUserRepository);
container.bind<IPostRepository>('IPostRepository').to(PrismaPostRepository);
container.bind<ICommentRepository>('ICommentRepository').to(PrismaCommentRepository);
container.bind<IAuditLogRepository>('IAuditLogRepository').to(PrismaAuditLogRepository);

// Bind Services
container.bind<IAuthService>('IAuthService').to(AuthService);
container.bind<IUserService>('IUserService').to(UserService);
container.bind<IPostService>('IPostService').to(PostService);
container.bind<ICommentService>('ICommentService').to(CommentService);
container.bind<IAuditService>('IAuditService').to(AuditService);

// Bind Controllers
container.bind<AuthController>('AuthController').to(AuthController);
container.bind<UserController>('UserController').to(UserController);
container.bind<PostController>('PostController').to(PostController);
container.bind<CommentController>('CommentController').to(CommentController);
container.bind<HealthController>('HealthController').to(HealthController);
container.bind<AuditController>('AuditController').to(AuditController);

export { container };
