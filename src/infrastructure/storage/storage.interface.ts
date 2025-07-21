export interface UploadResult {
  url: string;
  key: string;
}

export interface IFileStorage {
  upload(file: Express.Multer.File, path: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  isHealthy(): Promise<boolean>;
}
