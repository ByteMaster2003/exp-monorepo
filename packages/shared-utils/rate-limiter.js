import rateLimit from "express-rate-limit";

export class RateLimiter {
  constructor(nodeEnv = "production") {
    this.nodeEnv = nodeEnv;
  }

  /**
   * Creates a rate limiter middleware for Express.
   *
   * @param {Object} options - Configuration options for the rate limiter.
   * @param {number} [options.windowMs=60000] - Time window in milliseconds for rate limiting (default: 1 minutes).
   * @param {number} [options.max=5] - Maximum number of requests allowed within the time window (default: 5).
   * @returns {RateLimitRequestHandler} RateLimitRequestHandler - The rate limiter middleware.
   */
  create(config = { windowMs: 60 * 1000, max: 5 }) {
    return rateLimit({
      windowMs: this.nodeEnv === "development" ? 60000 : config.windowMs,
      max: this.nodeEnv === "development" ? 100 : config.max,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: "Too many requests! Please try again later"
        });
      }
    });
  }

  // Helper methods to create specific rate limiters
  threePerHour() {
    return this.create({ windowMs: 60 * 60 * 1000, max: 3 });
  }

  threePerDay() {
    return this.create({ windowMs: 24 * 60 * 60 * 1000, max: 3 });
  }

  hundredPerHour() {
    return this.create({ windowMs: 60 * 60 * 1000, max: 100 });
  }

  fiveHundredPerHour() {
    return this.create({ windowMs: 60 * 60 * 1000, max: 500 });
  }

  fivePerMinute() {
    return this.create({ windowMs: 60 * 1000, max: 5 });
  }

  twentyPerMinute() {
    return this.create({ windowMs: 60 * 1000, max: 20 });
  }
}

export default RateLimiter;
