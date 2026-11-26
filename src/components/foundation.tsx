"use client";
import Link from "next/link";
import { useId, useRef, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { Button, Notice, Empty } from "./ui";

export function Input({ label, hint, error, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const auto = useId(), controlId = id ?? auto;
  const described = [props["aria-describedby"], hint ? `${controlId}-hint` : null, error ? `${controlId}-error` : null].filter(Boolean).join(" ") || undefined;
  return <div className="field"><label htmlFor={controlId}>{label}</label>
    <input {...props} id={controlId} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={described} />
    {hint && <small id={`${controlId}-hint`}>{hint}</small>}
    {error && <small className="error-text" id={`${controlId}-error`}>{error}</small>}
  </div>;
}
export function Select({ label, options, id, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: readonly { value: string; label: string }[] }) {
  const auto = useId(), controlId = id ?? auto;
  return <div className="field"><label htmlFor={controlId}>{label}</label>
    <select {...props} id={controlId}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  </div>;
}
export function Navigation({ label, items, current }: { label: string; items: readonly { href: string; label: string }[]; current: string }) {
  return <nav aria-label={label} className="foundation-nav">{items.map(item => <Link key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>;
}
export function Tabs({ label, items, active, onChange }: { label: string; items: readonly { id: string; label: string; content: ReactNode }[]; active: string; onChange: (id: string) => void }) {
  const id = useId(), refs = useRef<(HTMLButtonElement | null)[]>([]);
  return <div><div className="foundation-tabs" role="tablist" aria-label={label}>
    {items.map((item, i) => <button key={item.id} ref={el => { refs.current[i] = el; }} type="button" role="tab" id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel-${item.id}`} aria-selected={active === item.id} tabIndex={active === item.id ? 0 : -1}
      onClick={() => onChange(item.id)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (i + 1) % items.length : event.key === "ArrowLeft" ? (i - 1 + items.length) % items.length : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : -1;
        if (next >= 0) { event.preventDefault(); onChange(items[next].id); refs.current[next]?.focus(); }
      }}>{item.label}</button>)}
  </div>{items.map(item => <div key={item.id} role="tabpanel" tabIndex={0} hidden={active !== item.id} id={`${id}-panel-${item.id}`} aria-labelledby={`${id}-tab-${item.id}`} className="foundation-panel">{item.content}</div>)}</div>;
}
export function DataTable<T>({ caption, rows, columns, rowKey }: { caption: string; rows: readonly T[]; columns: readonly { key: string; label: string; render: (row: T) => ReactNode }[]; rowKey: (row: T) => string }) {
  return <div className="foundation-table" role="region" aria-label={caption} tabIndex={0}><table>
    <caption>{caption}</caption><thead><tr>{columns.map(column => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map(row => <tr key={rowKey(row)}>{columns.map(column => <td key={column.key}>{column.render(row)}</td>)}</tr>) : <tr><td colSpan={columns.length}>No records to display.</td></tr>}</tbody>
  </table></div>;
}
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  const max = Math.max(1, Math.floor(pages)), current = Math.max(1, Math.min(max, Math.floor(page)));
  return <nav aria-label="Pagination" className="pagination"><Button variant="secondary" disabled={current === 1} onClick={() => onChange(current - 1)}>Previous</Button><span aria-live="polite">Page {current} of {max}</span><Button variant="secondary" disabled={current === max} onClick={() => onChange(current + 1)}>Next</Button></nav>;
}
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <div className="foundation-loading" role="status" aria-live="polite"><span className="skeleton" aria-hidden="true" /><span>{label}</span></div>;
}
export function ErrorState({ title, children, onRetry }: { title: string; children: ReactNode; onRetry?: () => void }) {
  return <Notice tone="error"><strong>{title}</strong><p>{children}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</Notice>;
}
export function Notification({ children, onDismiss }: { children: ReactNode; onDismiss: () => void }) {
  return <div className="notification"><Notice tone="success">{children}</Notice><Button variant="ghost" onClick={onDismiss} aria-label="Dismiss notification">Dismiss</Button></div>;
}
export function BarChart({ title, data }: { title: string; data: readonly { label: string; value: number }[] }) {
  const id = useId(), max = Math.max(1, ...data.map(d => Math.max(0, d.value)));
  if (!data.length) return <Empty title="No activity yet">Activity will appear when data is available.</Empty>;
  return <figure className="bar-chart"><figcaption>{title}</figcaption>
    <svg viewBox={`0 0 600 ${data.length * 52 + 32}`} role="img" aria-labelledby={id}>
      <title id={id}>{title}. {data.map(d => `${d.label}: ${d.value}`).join(". ")}</title>
      {data.map((d, i) => <g key={d.label}><text x="0" y={i * 52 + 30}>{d.label}</text><rect x="130" y={i * 52 + 12} height="26" width={Math.max(0, d.value) / max * 350} rx="2" /><text x="500" y={i * 52 + 30}>{d.value.toLocaleString("en-US")}</text></g>)}
      <text x="130" y={data.length * 52 + 20}>0</text><text x="460" y={data.length * 52 + 20}>{max.toLocaleString("en-US")}</text>
    </svg>
    <details><summary>View chart data</summary><table><caption>{title} data</caption><thead><tr><th scope="col">Status</th><th scope="col">Count</th></tr></thead><tbody>{data.map(d => <tr key={d.label}><th scope="row">{d.label}</th><td>{d.value}</td></tr>)}</tbody></table></details>
  </figure>;
}
