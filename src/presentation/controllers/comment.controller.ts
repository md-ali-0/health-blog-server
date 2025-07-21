import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ICommentService } from '../../application/services/comment.service';
import { catchAsync } from '../../shared/utils/catch-async.util';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class CommentController {
  constructor(@inject('ICommentService') private commentService: ICommentService) {}

  public createComment = catchAsync(async (req: Request, res: Response) => {
    const { content, postId } = req.body;
    // Assuming userId is available from an auth middleware, e.g., req.user.id
    const authorId = (req as any).user.id; 

    const comment = await this.commentService.createComment(
      { content, authorId, postId },
      { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    );

    ResponseUtil.sendSuccess(res, 'Comment created successfully', { comment }, 201);
  });
}
