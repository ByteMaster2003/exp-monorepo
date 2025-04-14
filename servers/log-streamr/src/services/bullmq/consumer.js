import { Worker } from "bullmq";

import { AppConfig } from "../../config/index.js";
import { redisClient } from "../../utils/index.js";
import logService from "../log.service.js";

/**
 * Batch size for processing logs
 * @type {number}
 */
const BATCH_SIZE = AppConfig.REDIS.WORKER_BATCH_SIZE;
const QUEUE_NAME = `${AppConfig.PROJECT_NAME}_logs_queue`;
const FLUSH_INTERVAL_MS = 60 * 1000;

let buffer = [];
let flushTimer;

// Start the flushing timer
function startFlushTimer() {
  flushTimer = setInterval(async () => {
    if (buffer.length > 0) {
      const batch = [...buffer];
      buffer = [];

      await logService.createLog(batch);
    }
  }, FLUSH_INTERVAL_MS);
}

startFlushTimer();

/**
 * Worker for processing logs from queue
 * @type {Worker}
 */
const logWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    buffer.push({ ...job.data });

    // If buffer is full, flush early
    if (buffer.length >= BATCH_SIZE) {
      const batch = [...buffer];
      buffer = [];
      await logService.createLog(batch);
    }
  },
  {
    connection: redisClient,
    concurrency: 100,
    autorun: false,
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000 // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 24 * 3600 // keep up to 24 hours
    }
  }
);

const consumerCleanUp = async () => {
  clearInterval(flushTimer);

  if (buffer.length > 0) {
    await logService.createLog(buffer);
  }

  await logWorker.close();
};

export { logWorker, consumerCleanUp };
