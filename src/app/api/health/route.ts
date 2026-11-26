export const dynamic = "force-dynamic";
/** Liveness only. No database or provider readiness is implied. */
export function GET() {
  return Response.json(
    { status: "ok", service: "web", mode: "demo" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
