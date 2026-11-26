export function readEnvironment(
  source: Record<string, string | undefined>,
  service: "web" | "worker" = "web",
) {
  if ((source.APP_MODE ?? "demo") !== "demo")
    throw new Error("Only APP_MODE=demo is implemented");
  for (const key of ["ENABLE_LIVE_SMS", "ENABLE_LIVE_BILLING"]) {
    if (source[key] !== undefined && source[key] !== "false")
      throw new Error(key + " must be false");
  }
  const appUrl = source.APP_URL ?? "http://localhost:3000";
  let url: URL;
  try {
    url = new URL(appUrl);
  } catch {
    throw new Error("Invalid APP_URL");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Invalid APP_URL");
  const queueUrl = source.QUEUE_URL;
  if (service === "worker" && !queueUrl)
    throw new Error("QUEUE_URL is required");
  if (queueUrl) {
    try {
      if (!["redis:", "rediss:"].includes(new URL(queueUrl).protocol))
        throw new Error();
    } catch {
      throw new Error("Invalid QUEUE_URL");
    }
  }
  const port = source.WORKER_HEALTH_PORT ?? "3001";
  if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
    throw new Error("Invalid WORKER_HEALTH_PORT");
  return { mode: "demo" as const, appUrl, queueUrl, workerPort: Number(port) };
}
