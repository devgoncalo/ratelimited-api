import { Context, Env, Hono } from "hono";
import { BlankInput } from "hono/types";
import { env } from "hono/adapter";

import { todos } from "./data/data.json";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

const app = new Hono();

const cache = new Map();

class RedisRateLimiter {
  static instance: Ratelimit;

  static getInstance(c: Context<Env, "/todos/:id", BlankInput>) {
    if (!this.instance) {
      const { REDIS_URL, REDIS_TOKEN } = env<{
        REDIS_URL: string;
        REDIS_TOKEN: string;
      }>(c);

      const redisClient = new Redis({
        token: REDIS_TOKEN,
        url: REDIS_URL,
      });

      const ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        ephemeralCache: cache,
      });

      this.instance = ratelimit;
      return this.instance;
    } else {
      return this.instance;
    }
  }
}

app.get("/todos/:id", (c) => {
  const todoId = c.req.param("id");
  const todoIndex = Number(todoId);
  const todo = todos[todoIndex] || {};

  return c.json({ todo });
});

export default app;
