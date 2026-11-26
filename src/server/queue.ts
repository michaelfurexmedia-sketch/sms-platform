import { Queue } from "bullmq";
import { Redis } from "ioredis";
export const foundationQueue = "platform-foundation";
export function queueConnection(url: string, worker = false) {
  return new Redis(url, {
    maxRetriesPerRequest: worker ? null : 1,
    connectTimeout: 5000,
    enableOfflineQueue: worker,
  });
}
export function createFoundationQueue(url: string) {
  const connection = queueConnection(url);
  const queue = new Queue(foundationQueue, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    },
  });
  return { queue, connection };
}
