export interface JobData {
  [key: string]: unknown;
}

export interface IJobQueue {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  addJob(queueName: string, jobName: string, data: JobData): Promise<void>;
  isHealthy(): Promise<boolean>;
}
