import { Job, Queue, Worker } from 'bullmq';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../shared/interfaces/logger.interface';
import { IEmailService } from '../email/email.interface';
import { IJobQueue, JobData } from './queue.interface';

@injectable()
export class BullMQQueue implements IJobQueue {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(
    @inject('ILogger') private logger: ILogger,
    @inject('IEmailService') private emailService: IEmailService
  ) {}

  async connect(): Promise<void> {
    // Create email queue
    const emailQueue = new Queue('email', {
      connection: { host: 'localhost', port: 6379 },
    });
    
    this.queues.set('email', emailQueue);

    // Create email worker
    const emailWorker = new Worker('email', async (job: Job) => {
      await this.processEmailJob(job);
    }, {
      connection: { host: 'localhost', port: 6379 },
    });

    this.workers.set('email', emailWorker);

    emailWorker.on('completed', (job) => {
      this.logger.info(`Email job completed: ${job.id}`);
    });

    emailWorker.on('failed', (job, err) => {
      this.logger.error(`Email job failed: ${job?.id}`, err);
    });

    this.logger.info('Job queue connected successfully');
  }

  async disconnect(): Promise<void> {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.logger.info('Job queue disconnected');
  }

  async addJob(queueName: string, jobName: string, data: JobData): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.add(jobName, data);
    this.logger.info(`Job added to queue: ${queueName}/${jobName}`);
  }

async isHealthy(): Promise<boolean> {
  try {
    const emailQueue = this.queues.get('email');
    if (!emailQueue) return false;
      
    await emailQueue.getWaiting(); // <-- This tries a Redis command
    return true;
  } catch {
    return false;
  }
}

  private async processEmailJob(job: Job): Promise<void> {
    const { to, subject, text, html } = job.data;
    await this.emailService.sendEmail({ to, subject, text, html });
  }
}
