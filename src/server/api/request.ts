export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export function pagination(params: URLSearchParams) {
  const parse = (key: string, fallback: number, max: number) => {
    const raw = params.get(key);
    if (raw === null) return fallback;
    if (!/^[1-9]\d*$/.test(raw)) throw new ApiError(400, "INVALID_PAGINATION");
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value > max)
      throw new ApiError(400, "INVALID_PAGINATION");
    return value;
  };
  const page = parse("page", 1, 10000),
    limit = parse("limit", 25, 100);
  return { page, limit, skip: (page - 1) * limit };
}
export function errorResponse(error: unknown, requestId: string) {
  const known = error instanceof ApiError;
  return Response.json(
    { error: { code: known ? error.code : "INTERNAL_ERROR", requestId } },
    {
      status: known ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
export function requireSameOrigin(request: Request, appUrl: string) {
  if (request.headers.get("origin") !== new URL(appUrl).origin)
    throw new ApiError(403, "ORIGIN_REJECTED");
}
export async function readJson(
  request: Request,
  maximumBytes = 65536,
): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    throw new ApiError(415, "JSON_REQUIRED");
  if (!request.body) throw new ApiError(400, "INVALID_JSON");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel();
        throw new ApiError(413, "BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    try {
      return JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch {
      throw new ApiError(400, "INVALID_JSON");
    }
  } finally {
    reader.releaseLock();
  }
}
