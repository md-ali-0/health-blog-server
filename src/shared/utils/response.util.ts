import { Response } from 'express';
import { ApiResponse } from '../types/common.types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      data,
      message,
      status: 'success',
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message = 'Created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message = 'No content'): Response {
    return res.status(204).json({
      message,
      status: 'success',
    });
  }
}