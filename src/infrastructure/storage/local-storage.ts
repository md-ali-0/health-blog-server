import { injectable, inject } from 'inversify';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IFileStorage, UploadResult } from './storage.interface';
import { ILogger } from '../../shared/interfaces/logger.interface';
import { config } from '../../config/config';

@injectable()
export class LocalFileStorage implements IFileStorage {
  private uploadDir: string;

  constructor(@inject('ILogger') private logger: ILogger) {
    this.uploadDir = path.resolve(config.upload.dest);
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, uploadPath: string): Promise<UploadResult> {
    try {
      const key = `${uploadPath}/${uuidv4()}-${file.originalname}`;
      const fullPath = path.join(this.uploadDir, key);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Write file
      await fs.writeFile(fullPath, file.buffer);
      
      const url = `/uploads/${key}`;
      this.logger.info(`File uploaded successfully: ${key}`);
      
      return { url, key };
    } catch (error) {
      this.logger.error('Failed to upload file', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, key);
      await fs.unlink(fullPath);
      this.logger.info(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw error;
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async isHealthy(): Promise<boolean> {
    try {
      await fs.access(this.uploadDir);
      return true;
    } catch {
      return false;
    }
  }
}