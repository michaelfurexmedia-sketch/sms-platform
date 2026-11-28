import { parseCSV } from "../lib/model";
/** Bound decompression before the workbook parser sees untrusted ZIP content. */
export function validateWorkbook(bytes: Uint8Array) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 22 || v.getUint32(0, true) !== 0x04034b50)
    throw Error("File content is not an XLSX workbook.");
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (v.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  if (end < 0) throw Error("Invalid workbook archive.");
  const count = v.getUint16(end + 10, true);
  let offset = v.getUint32(end + 16, true),
    total = 0;
  if (
    !count ||
    count > 500 ||
    v.getUint16(end + 4, true) ||
    v.getUint16(end + 6, true)
  )
    throw Error("Unsupported workbook archive.");
  let workbook = false;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || v.getUint32(offset, true) !== 0x02014b50)
      throw Error("Invalid workbook directory.");
    if (v.getUint16(offset + 8, true) & 1)
      throw Error("Encrypted workbooks are not supported.");
    total += v.getUint32(offset + 24, true);
    if (total > 20 * 1024 * 1024)
      throw Error("Expanded workbook exceeds the 20 MB safety limit.");
    const len = v.getUint16(offset + 28, true),
      extra = v.getUint16(offset + 30, true),
      comment = v.getUint16(offset + 32, true);
    if (offset + 46 + len + extra + comment > end)
      throw Error("Invalid workbook directory.");
    const name = new TextDecoder().decode(
      bytes.subarray(offset + 46, offset + 46 + len),
    );
    if (name === "xl/workbook.xml") workbook = true;
    offset += 46 + len + extra + comment;
  }
  if (!workbook) throw Error("Archive does not contain an XLSX workbook.");
}
export async function readContactFile(file: File) {
  if (file.size > 5 * 1024 * 1024 || !file.size)
    throw Error("Choose a nonempty file up to 5 MB.");
  const buffer = await file.arrayBuffer(),
    bytes = new Uint8Array(buffer);
  let rows: string[][];
  if (/\.xlsx$/i.test(file.name)) {
    validateWorkbook(bytes);
    rows = (
      await (await import("read-excel-file/browser")).readSheet(file)
    ).map((r) => r.map((c) => (c === null ? "" : String(c))));
  } else if (/\.csv$/i.test(file.name)) {
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw Error("CSV must contain UTF-8 text.");
    }
    if (/[\u0000-\u0008\u000e-\u001f]/.test(text) || /^\s*[<{[]/.test(text))
      throw Error("File content is not a CSV spreadsheet.");
    rows = parseCSV(text);
  } else throw Error("Choose a CSV or XLSX file.");
  if (
    rows.length < 2 ||
    rows.length > 10001 ||
    rows.some((r) => r.length > 100 || r.some((c) => c.length > 10000))
  )
    throw Error(
      "Use a header and 1–10,000 rows, up to 100 columns and 10,000 characters per cell.",
    );
  const fingerprint = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { rows, fingerprint };
}
