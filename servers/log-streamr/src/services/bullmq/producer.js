import { Queue } from "bullmq";

import { AppConfig, Logger } from "../../config/index.js";
import { SocketIO } from "../../socket/index.js";
import { redisClient } from "../../utils/index.js";

const QueueName = `${AppConfig.PROJECT_NAME}_logs_queue`;

/**
 * Queue for processing log messages
 * @type {Queue}
 */
const logQueue = new Queue(QueueName, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000
    }
  }
});

let keepLogProcessingRunning = true;

/**
 * Process logs from Redis stream and add to queue
 * @param {Object} options - Stream reading options
 * @param {string} options.streamName - Redis stream name
 * @param {number} [options.batchSize=100] - Maximum messages to read at once
 * @returns {Promise<void>}
 */
const processLogStream = async ({ streamName, batchSize = 100 }) => {
  while (keepLogProcessingRunning) {
    try {
      // Read from Redis Stream
      const response = await redisClient.xread("COUNT", batchSize, "STREAMS", streamName, "0");

      // If no messages, continue
      if (!response || !response.length) {
        // Add delay for non-blocking mode to prevent CPU spinning
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      // Process messages
      const [streamData] = response;
      const [, messages] = streamData;

      for (const [messageId, fields] of messages) {
        // Convert array of field-value pairs to object
        const logData = {};
        for (let i = 0; i < fields.length; i += 2) {
          logData[fields[i]] = fields[i + 1];
        }

        // Add to queue
        await logQueue.add("process-log", logData);

        // Broadcast to connected sockets
        SocketIO.emit("new-log", logData);

        // Delete message
        await redisClient.xdel(streamName, messageId);
      }
    } catch (error) {
      Logger.error({
        message: "Error processing log stream",
        stack: error.stack
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};

const terminateLogProcessing = async () => {
  keepLogProcessingRunning = false;

  // give time to exit the loop
  await new Promise((res) => setTimeout(res, 500));
};

export { logQueue, processLogStream, terminateLogProcessing };
