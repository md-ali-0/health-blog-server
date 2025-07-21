import { Router } from 'express';
import { Container } from 'inversify';
import { PostController } from '../controllers/post.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { CreatePostSchema, UpdatePostSchema, PaginationSchema, SearchSchema } from '../../shared/validation/schemas';
import { Role } from '../../domain/entities/user.entity';

export function postRoutes(container: Container): Router {
  const router = Router();
  const postController = container.get<PostController>('PostController');

  router.get('/search', 
    validateQuery(PaginationSchema.merge(SearchSchema)),
    (req, res, next) => postController.search(req, res, next)
  );

  router.get('/', 
    validateQuery(PaginationSchema.merge(SearchSchema)),
    (req, res, next) => postController.findMany(req, res, next)
  );

  router.get('/author/:authorId', 
    validateQuery(PaginationSchema),
    (req, res, next) => postController.findByAuthor(req, res, next)
  );

  router.get('/:id', 
    (req, res, next) => postController.findById(req, res, next)
  );

  router.get('/slug/:slug', 
    (req, res, next) => postController.findBySlug(req, res, next)
  );

  router.post('/', 
    authenticate(), 
    authorize([Role.ADMIN, Role.EDITOR]), 
    validateBody(CreatePostSchema), 
    (req, res, next) => postController.create(req, res, next)
  );

  router.put('/:id', 
    authenticate(), 
    authorize([Role.ADMIN, Role.EDITOR]), 
    validateBody(UpdatePostSchema), 
    (req, res, next) => postController.update(req, res, next)
  );

  router.delete('/:id', 
    authenticate(), 
    authorize([Role.ADMIN, Role.EDITOR]), 
    (req, res, next) => postController.delete(req, res, next)
  );

  return router;
}
