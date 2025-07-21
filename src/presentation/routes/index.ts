import { Application, Router } from 'express';
import authRoutes from './auth.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';
import healthRoutes from './health.routes';
import auditRoutes from './audit.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/health', healthRoutes);
router.use('/audits', auditRoutes);

export const setupRoutes = (app: Application): void => {
  app.use('/api/v1', router);
};
