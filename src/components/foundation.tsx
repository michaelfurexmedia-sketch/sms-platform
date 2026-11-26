"use client";
import { useId, useRef, type ReactNode, type KeyboardEvent } from "react";
import Link from "next/link";
import { Button, EmptyState } from "./ui";

export function Navigation({
  items,
  current,
  label,
}: {
  items: { href: string; label: string }[];
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="navigation">
      {items.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          aria-current={current === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
export function Tabs({
  items,
  selected,
  onChange,
  label,
}: {
  items: { id: string; label: string; content: ReactNode }[];
  selected: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = items.some((item) => item.id === selected)
    ? selected
    : items[0]?.id;
  return (
    <div>
      <div role="tablist" aria-label={label} className="tabs">
        {items.map((item, index) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            id={id + "-tab-" + item.id}
            aria-selected={current === item.id}
            aria-controls={id + "-panel-" + item.id}
            tabIndex={current === item.id ? 0 : -1}
            ref={(node) => {
              refs.current[index] = node;
            }}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === "ArrowRight") next = (index + 1) % items.length;
              else if (event.key === "ArrowLeft")
                next = (index - 1 + items.length) % items.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = items.length - 1;
              else return;
              event.preventDefault();
              onChange(items[next].id);
              refs.current[next]?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          role="tabpanel"
          key={item.id}
          tabIndex={0}
          id={id + "-panel-" + item.id}
          aria-labelledby={id + "-tab-" + item.id}
          hidden={current !== item.id}
          className="tab-panel"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
}: {
  caption: string;
  columns: { key: string; label: string; render: (row: T) => ReactNode }[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  if (!rows.length)
    return (
      <EmptyState title="No results" description="Try changing the filter." />
    );
  return (
    <div
      className="table-scroll"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th scope="col" key={column.key}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const count = Number.isFinite(totalPages)
    ? Math.max(1, Math.floor(totalPages))
    : 1;
  const current = Number.isFinite(page)
    ? Math.min(count, Math.max(1, Math.floor(page)))
    : 1;
  return (
    <nav aria-label="Pagination" className="pagination">
      <Button
        variant="secondary"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        Previous
      </Button>
      <span aria-live="polite">
        Page {current} of {count}
      </span>
      <Button
        variant="secondary"
        disabled={current === count}
        onClick={() => onChange(current + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
export function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && ref.current) {
      ref.current.open = false;
      ref.current.querySelector("summary")?.focus();
    }
  }
  return (
    <details ref={ref} className="dropdown">
      <summary onKeyDown={onKeyDown}>{label}</summary>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link onKeyDown={onKeyDown} href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
export function BarChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const id = useId();
  const values = data.filter(
    (item) => Number.isFinite(item.value) && item.value >= 0,
  );
  if (!values.length)
    return (
      <EmptyState
        title="No activity yet"
        description="Activity will appear here when available."
      />
    );
  const max = Math.max(1, ...values.map((item) => item.value));
  return (
    <figure className="chart">
      <figcaption id={id}>{title}</figcaption>
      <svg
        viewBox={"0 0 600 " + values.length * 42}
        role="img"
        aria-labelledby={id}
      >
        <desc>
          {values.map((item) => item.label + ": " + item.value).join("; ")}
        </desc>
        {values.map((item, index) => (
          <g key={item.label}>
            <text x="0" y={index * 42 + 26}>
              {item.label}
            </text>
            <rect
              x="100"
              y={index * 42 + 8}
              width={(item.value / max) * 420}
              height="24"
              rx="2"
            />
            <text x="540" y={index * 42 + 26}>
              {item.value}
            </text>
          </g>
        ))}
      </svg>
      <details>
        <summary>View chart data</summary>
        <table>
          <caption>{title} values</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">Messages</th>
            </tr>
          </thead>
          <tbody>
            {values.map((item) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
