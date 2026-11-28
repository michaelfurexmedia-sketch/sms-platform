"use client";
import { useState } from "react";
import { Button, Input, Select, Modal } from "@/components/ui";
import { type Workspace } from "@/lib/model";
import { useStore } from "@/lib/store";
import {
  commitImport,
  reviewImport,
  tagNames,
  saveTag,
} from "./contact-domain";
import { readContactFile } from "./import-file";
import { downloadCSV } from "./scheduling";
export function ContactImport({
  w,
  onClose,
  onDone,
}: {
  w: Workspace;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { mutate } = useStore();
  const [rows, setRows] = useState<string[][]>([]),
    [file, setFile] = useState(""),
    [hash, setHash] = useState(""),
    [name, setName] = useState("");
  const [first, setFirst] = useState(-1),
    [phone, setPhone] = useState(-1),
    [tags, setTags] = useState<string[]>([]),
    [newTag, setNewTag] = useState("");
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [progress, setProgress] = useState(0);
  const mapped = rows
    .slice(1)
    .map((r) => ({
      firstName: (r[first] || "").trim(),
      phone: (r[phone] || "").trim(),
    }));
  const review = reviewImport(w, mapped),
    accepted = review.filter((r) => !r.issue).length;
  const counts = {
    total: review.length,
    valid: review.filter(
      (r) =>
        !r.issue.startsWith("Invalid") && !r.issue.startsWith("First name"),
    ).length,
    invalid: review.filter(
      (r) => r.issue.startsWith("Invalid") || r.issue.startsWith("First name"),
    ).length,
    duplicates: review.filter((r) => r.issue.startsWith("Duplicate")).length,
    skipped: review.filter((r) => !!r.issue).length,
    reviewRequired: accepted,
  };
  async function upload(file: File) {
    setBusy(true);
    setError("");
    setRows([]);
    setHash("");
    try {
      const result = await readContactFile(file);
      setRows(result.rows);
      setHash(result.fingerprint);
      setFile(file.name);
      setName(file.name.replace(/\.[^.]+$/, "").slice(0, 100));
      const h = result.rows[0].map((v) =>
        v.toLowerCase().replace(/[ _-]/g, ""),
      );
      setFirst(h.findIndex((v) => ["firstname", "name"].includes(v)));
      setPhone(
        h.findIndex((v) =>
          ["phone", "phonenumber", "mobile", "number"].includes(v),
        ),
      );
      setStep(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    setBusy(true);
    setError("");
    setProgress(10);
    // Yield a paint before the single atomic browser-store transaction.
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    try {
      const result = mutate((s) =>
        commitImport(s, w.id, mapped, name, file, hash, tags),
      );
      setProgress(100);
      setStep(3);
      onDone(
        `${result.name}: ${result.added} contacts added; ${result.skipped} skipped. All new contacts require consent review. No messages sent.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      title={
        step === 0
          ? "Import your contacts"
          : step === 1
            ? "Match your columns"
            : step === 2
              ? "Review your import"
              : "Import complete"
      }
      onClose={busy ? () => {} : onClose}
    >
      <p>
        Fictional data only. Files stay in this browser. Importing never grants
        messaging consent.
      </p>
      {error && <p role="alert">{error}</p>}
      {busy && (
        <div role="status">
          {progress ? "Saving import…" : "Reading and validating file…"}
          <progress
            aria-label="Import progress"
            max="100"
            value={progress || undefined}
          />
        </div>
      )}
      {step === 0 && (
        <Input
          label="CSV or XLSX file"
          type="file"
          accept=".csv,.xlsx"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files?.[0]) void upload(e.target.files[0]);
          }}
        />
      )}
      {step === 0 && (
        <p>
          UTF-8 CSV or XLSX first worksheet. Maximum 5 MB, 10,000 rows. Map only
          First Name and Phone Number.
        </p>
      )}
      {step === 1 && (
        <>
          <Input
            label="Import batch name"
            maxLength={100}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {(
            [
              ["First Name", first, setFirst],
              ["Phone Number", phone, setPhone],
            ] as const
          ).map(([label, value, change]) => (
            <Select
              key={label}
              label={label}
              value={value}
              onChange={(e) => change(Number(e.target.value))}
            >
              <option value={-1}>
                {label === "First Name" ? "Not mapped" : "Choose phone column"}
              </option>
              {rows[0].map((h, i) => (
                <option key={i} value={i}>
                  {h || `Column ${i + 1}`}
                </option>
              ))}
            </Select>
          ))}
          <fieldset>
            <legend>Apply workspace tags</legend>
            {tagNames(w).map((t) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={tags.includes(t)}
                  onChange={(e) =>
                    setTags(
                      e.target.checked
                        ? [...tags, t]
                        : tags.filter((v) => v !== t),
                    )
                  }
                />{" "}
                {t}{" "}
              </label>
            ))}
            <p>Spreadsheet columns never create tags automatically.</p>
          </fieldset>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                mutate((s) => saveTag(s, w.id, newTag));
                setTags([...tags, newTag.trim()]);
                setNewTag("");
                setError("");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <Input
              label="Create workspace tag"
              maxLength={40}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <Button variant="secondary" type="submit" disabled={!newTag.trim()}>
              Create tag
            </Button>
          </form>
          <Button
            disabled={phone < 0 || first === phone || !name.trim()}
            onClick={() => setStep(2)}
          >
            Preview import
          </Button>
          <Button variant="quiet" onClick={() => setStep(0)}>
            Choose another file
          </Button>
        </>
      )}
      {step === 2 && (
        <>
          <dl className="import-counts">
            {Object.entries(counts).map(([key, value]) => (
              <div key={key}>
                <dt>{key === "reviewRequired" ? "Review required" : key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p>
            Duplicates, invalid rows and known opt-outs are skipped. {accepted}{" "}
            new contacts will be saved as leads pending consent review.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>First name</th>
                  <th>Phone</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {review.slice(0, 100).map((r) => (
                  <tr key={r.row}>
                    <td>{r.row}</td>
                    <td>{r.firstName || "—"}</td>
                    <td>{r.phone}</td>
                    <td>{r.issue || "Ready · consent review required"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Showing up to 100 rows. Download the report for every row and its
            individual result.
          </p>
          <Button
            variant="secondary"
            onClick={() =>
              downloadCSV("import-review.csv", [
                ["Row", "First name", "Phone", "Result"],
                ...review.map((r) => [
                  r.row,
                  r.firstName,
                  r.phone,
                  r.issue || "Consent review required",
                ]),
              ])
            }
          >
            Download validation report
          </Button>
          <div className="actions">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setStep(1)}
            >
              Back to mapping
            </Button>
            <Button disabled={busy} onClick={() => void confirm()}>
              Confirm import
            </Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <p role="status">
            Saved named batch “{name}”. Review the results and history on the
            contacts page.
          </p>
          <progress aria-label="Import progress" value={100} max={100} />
          <Button onClick={onClose}>Done</Button>
        </>
      )}
    </Modal>
  );
}
