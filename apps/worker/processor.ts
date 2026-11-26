import { UnrecoverableError } from "bullmq";
/** Only a harmless probe is enabled. No messaging/payment handler exists. */
export async function processFoundationJob(job: { name: string; data: unknown }) {
  if (job.name !== "system.probe") throw new UnrecoverableError("Unsupported foundation job.");
  const data = job.data;
  if (typeof data !== "object" || data === null ||
      Object.keys(data).length !== 1 || !("probeId" in data) ||
      typeof data.probeId !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(data.probeId))
    throw new UnrecoverableError("Invalid probe payload.");
  return { probeId: data.probeId, processed: true };
}
