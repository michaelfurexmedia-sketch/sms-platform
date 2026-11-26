type Environment = Record<string, string | undefined>;
export function readEnvironment(source: Environment, service: "web" | "worker" = "web") {
  const mode = source.APP_MODE ?? "demo";
  if (mode !== "demo") throw new Error("APP_MODE must be demo until production services are implemented.");
  if (source.ENABLE_LIVE_SMS === "true" || source.ENABLE_LIVE_BILLING === "true")
    throw new Error("Live messaging and billing are unavailable in Phase 1.");
  const appUrl = source.APP_URL ?? "http://localhost:3000";
  let parsed: URL;
  try { parsed = new URL(appUrl); } catch { throw new Error("APP_URL must be an HTTP(S) URL."); }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password)
    throw new Error("APP_URL must be an HTTP(S) URL without credentials.");
  const queueUrl = source.QUEUE_URL;
  if (service === "worker" && !queueUrl) throw new Error("QUEUE_URL is required by the worker.");
  if (queueUrl) {
    try {
      const url = new URL(queueUrl);
      if (!["redis:", "rediss:"].includes(url.protocol)) throw new Error();
    } catch { throw new Error("QUEUE_URL must use redis:// or rediss://."); }
  }
  const port = Number(source.WORKER_HEALTH_PORT ?? "3001");
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error("WORKER_HEALTH_PORT must be an integer from 1024 to 65535.");
  return { mode, appUrl: parsed.origin, queueUrl, workerHealthPort: port } as const;
}
