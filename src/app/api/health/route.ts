import { readEnvironment } from "@/server/env";
export const dynamic = "force-dynamic";
export function GET() {
  const env = readEnvironment(process.env);
  return Response.json({ status: "ok", service: "web", mode: env.mode }, { headers: { "Cache-Control": "no-store" } });
}
