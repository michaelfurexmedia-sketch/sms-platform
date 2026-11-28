"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { type Workspace, workspace, normalizePhone } from "@/lib/model";
import { Button, Input, Modal, Select } from "@/components/ui";
import { downloadCSV } from "./scheduling";
export function ContactTools({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const [open, setOpen] = useState(false),
    [group, setGroup] = useState(""),
    [field, setField] = useState(""),
    [value, setValue] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [notice, setNotice] = useState("");
  const change = (fn: (v: Workspace) => void) => {
    try {
      mutate((s) => fn(workspace(s, w.id)));
      setNotice("Demo contacts updated.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  };
  return (
    <section className="contact-tools">
      <div className="actions">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Lists & bulk actions
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCSV("contacts-demo.csv", [
              ["Name", "Phone", "Status", "List", "Tags", "Consent"],
              ...w.contacts.map((c) => [
                c.firstName,
                c.phone,
                c.status,
                c.group,
                c.tags.join(";"),
                c.consent,
              ]),
            ])
          }
        >
          Export contacts
        </Button>
        <Button
          variant="quiet"
          onClick={() =>
            downloadCSV("contact-review.csv", [
              ["Phone", "Category"],
              ...w.contacts
                .filter(
                  (c) =>
                    c.duplicate ||
                    c.status === "Invalid number" ||
                    c.status === "Opted out" ||
                    c.delivery,
                )
                .map((c) => [
                  c.phone,
                  c.status === "Opted out"
                    ? "Confirmed opt-out"
                    : c.duplicate
                      ? "Duplicate"
                      : c.status === "Invalid number"
                        ? "Invalid number"
                        : c.delivery,
                ]),
            ])
          }
        >
          Download review report
        </Button>
      </div>
      <details>
        <summary>Import history · {w.preview?.imports?.length || 0}</summary>
        {w.preview?.imports?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Batch / file</th>
                  <th>Total</th>
                  <th>Added</th>
                  <th>Skipped</th>
                  <th>Review required</th>
                  <th>Duplicates</th>
                  <th>Invalid</th>
                  <th>Suppressed</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {w.preview.imports.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {i.name || i.file}
                      <small>{i.name ? i.file : ""}</small>
                    </td>
                    <td>{i.total ?? "—"}</td>
                    <td>{i.added}</td>
                    <td>{i.skipped ?? "—"}</td>
                    <td>{i.reviewRequired ?? "—"}</td>
                    <td>{i.duplicates}</td>
                    <td>{i.invalid}</td>
                    <td>{i.suppressed}</td>
                    <td>{new Date(i.at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No spreadsheet imports yet.</p>
        )}
      </details>
      {notice && <p role="status">{notice}</p>}
      <Modal
        open={open}
        title="Lists & bulk actions"
        onClose={() => setOpen(false)}
      >
        <p>Select contacts, then organize them without changing consent.</p>
        <label>
          <input
            type="checkbox"
            checked={
              selected.length === w.contacts.length && !!w.contacts.length
            }
            onChange={(e) =>
              setSelected(e.target.checked ? w.contacts.map((c) => c.id) : [])
            }
          />{" "}
          Select all contacts
        </label>
        <div className="bulk-contact-list">
          {w.contacts.map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, c.id]
                      : selected.filter((id) => id !== c.id),
                  )
                }
              />
              {c.firstName || normalizePhone(c.phone)} · {c.status}
            </label>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            change((v) =>
              v.contacts
                .filter((c) => selected.includes(c.id))
                .forEach((c) => {
                  c.group = group.trim();
                }),
            );
          }}
        >
          <Input
            label="List name"
            required
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            list="known-lists"
          />
          <datalist id="known-lists">
            {[...new Set(w.contacts.map((c) => c.group).filter(Boolean))].map(
              (g) => (
                <option key={g}>{g}</option>
              ),
            )}
          </datalist>
          <Button type="submit" disabled={!selected.length}>
            Move selected to list
          </Button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            change((v) =>
              v.contacts
                .filter((c) => selected.includes(c.id))
                .forEach((c) => {
                  c.customFields = { ...c.customFields, [field]: value };
                }),
            );
          }}
        >
          <Input
            label="Custom field name"
            required
            pattern="[a-zA-Z][a-zA-Z0-9_ ]{0,39}"
            value={field}
            onChange={(e) => setField(e.target.value)}
          />
          <Input
            label="Custom field value"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={200}
          />
          <Button type="submit" variant="secondary" disabled={!selected.length}>
            Apply custom field
          </Button>
        </form>
        <Select label="Existing lists" defaultValue="">
          <option value="">Review list names</option>
          {[...new Set(w.contacts.map((c) => c.group).filter(Boolean))].map(
            (g) => (
              <option key={g}>{g}</option>
            ),
          )}
        </Select>
      </Modal>
    </section>
  );
}
