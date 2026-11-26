import { UnrecoverableError } from "bullmq";
export function processJob(name: string, data: unknown) {
  if (name !== "system.probe" || !data || typeof data !== "object" || Array.isArray(data)) {
    throw new UnrecoverableError("Unsupported foundation job");
  }
  const payload = data as Record<string, unknown>;
  if (Object.keys(payload).length !== 1 || typeof payload.probeId !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(payload.probeId)) {
    throw new UnrecoverableError("Invalid probe payload");
  }
  return { probeId: payload.probeId, status: "ok" };
}
