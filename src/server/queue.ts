import { Queue } from "bullmq";
import IORedis from "ioredis";
export const queueName = "platform-foundation";
export function connection(url: string, worker = false) {
  const client = new IORedis(url, {
    maxRetriesPerRequest: worker ? null : 1,
    connectTimeout: 5000,
    enableOfflineQueue: worker
  });
  client.on("error", () => { console.error("Queue connection unavailable"); });
  return client;
}
export function createQueue(url: string) {
  const client = connection(url);
  const queue = new Queue(queueName, { connection: client, defaultJobOptions: {
    attempts: 3, backoff: { type: "exponential", delay: 500 },
    removeOnComplete: { count: 100 }, removeOnFail: { count: 100 }
  } });
  return { queue, client };
}
