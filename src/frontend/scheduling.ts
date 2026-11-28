export const timeZones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Karachi",
];
export function wallTime(iso: string, zone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (key: string) => parts.find((p) => p.type === key)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
/** Reject DST gaps/overlaps instead of silently moving a scheduled campaign. */
export function scheduleInstant(local: string, zone: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))
    throw Error("Choose a complete date and time.");
  const nominal = Date.parse(local + "Z");
  if (!Number.isFinite(nominal)) throw Error("Invalid date.");
  const candidates = new Set<string>();
  for (const delta of [-36, -12, 0, 12, 36]) {
    const probe = nominal + delta * 3600000;
    const offset =
      Date.parse(wallTime(new Date(probe).toISOString(), zone) + "Z") - probe;
    const iso = new Date(nominal - offset).toISOString();
    if (wallTime(iso, zone) === local) candidates.add(iso);
  }
  if (candidates.size !== 1)
    throw Error(
      candidates.size
        ? "This time occurs twice during a clock change. Choose another time or UTC."
        : "This local time does not exist. Choose a valid time.",
    );
  return [...candidates][0];
}
export function csvText(rows: unknown[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          return (
            '"' +
            (/^[=+\-@\t\r]/.test(text) ? "'" + text : text).replaceAll(
              '"',
              '""',
            ) +
            '"'
          );
        })
        .join(","),
    )
    .join("\r\n");
}
export function downloadCSV(name: string, rows: unknown[][]) {
  const url = URL.createObjectURL(
    new Blob([csvText(rows)], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
