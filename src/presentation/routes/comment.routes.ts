import { Router } from 'express';
import { Container } from 'inversify';
import { CommentController } from '../controllers/comment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { CreateCommentSchema, UpdateCommentSchema, PaginationSchema } from '../../shared/validation/schemas';
import { Role } from '../../domain/entities/user.entity';

export function commentRoutes(container: Container): Router {
  const router = Router();
  const commentController = container.get<CommentController>('CommentController');

  router.get('/post/:postId', 
    validateQuery(PaginationSchema),
    (req, res, next) => commentController.findByPost(req, res, next)
  );

  router.get('/replies/:parentId', 
    validateQuery(PaginationSchema),
    (req, res, next) => commentController.findReplies(req, res, next)
  );

  router.get('/:id', 
    (req, res, next) => commentController.findById(req, res, next)
  );

  router.post('/', 
    authenticate(), 
    validateBody(CreateCommentSchema), 
    (req, res, next) => commentController.create(req, res, next)
  );

  router.put('/:id', 
    authenticate(), 
    validateBody(UpdateCommentSchema), 
    (req, res, next) => commentController.update(req, res, next)
  );

  router.delete('/:id', 
    authenticate(), 
    authorize([Role.ADMIN, Role.EDITOR]), 
    (req, res, next) => commentController.delete(req, res, next)
  );

  return router;
}
