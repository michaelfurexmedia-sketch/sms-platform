import { test } from "node:test";
import assert from "node:assert/strict";
import {
  freshState,
  seedDemo,
  register,
  setContactStatus,
} from "../src/lib/model";
import {
  saveTag,
  deleteTag,
  assignTag,
  tagNames,
  saveContact,
  deleteContact,
  commitImport,
  reviewImport,
} from "../src/frontend/contact-domain";
import { readContactFile, validateWorkbook } from "../src/frontend/import-file";
test("tags are owned by active workspace and rename/delete update memberships only", () => {
  const s = freshState(),
    w = seedDemo(s),
    other = register(s, "other@example.com");
  s.activeId = w.id;
  saveTag(s, w.id, "Clients");
  assignTag(s, w.id, [w.contacts[0].id], "Clients");
  saveTag(s, w.id, "VIP", "Clients");
  assert.ok(w.contacts[0].tags.includes("VIP"));
  assert.throws(() => saveTag(s, w.id, "vip"), /already/);
  assert.throws(() => saveTag(s, other.id, "Foreign"), /own workspace/);
  assert.throws(
    () => assignTag(s, w.id, ["foreign-contact"], "VIP"),
    /not found/,
  );
  assert.equal(tagNames(other).length, 0);
  deleteTag(s, w.id, "VIP");
  assert.ok(!w.contacts[0].tags.includes("VIP"));
  assert.equal(w.contacts[0].status, "Subscribed");
});
test("contact edits cannot transfer consent and deletions retain opt-outs", () => {
  const s = freshState(),
    w = seedDemo(s);
  saveContact(s, w.id, "Taylor", "2025550120");
  const c = w.contacts.at(-1)!;
  assert.equal(c.status, "Lead");
  assert.equal(c.consent, "");
  assert.throws(() => saveContact(s, w.id, "Duplicate", c.phone), /already/);
  assert.throws(
    () => saveContact(s, w.id, "Changed", "2025550121", c.id),
    /cannot be transferred/,
  );
  setContactStatus(s, w.id, c.id, "Opted out");
  deleteContact(s, w.id, c.id);
  saveContact(s, w.id, "Again", c.phone);
  assert.equal(w.contacts.at(-1)!.status, "Opted out");
  assert.ok(w.preview?.deletedContacts?.some((x) => x.id === c.id));
});
test("imports skip bad rows and duplicates, preserve suppression, never invent consent and are idempotent", () => {
  const s = freshState(),
    w = seedDemo(s);
  const rows = [
    { firstName: "New", phone: "2025550120" },
    { firstName: "Repeated", phone: "2025550120" },
    { firstName: "Bad", phone: "12" },
    { firstName: "Stop", phone: "2025550103" },
  ];
  assert.equal(reviewImport(w, rows).filter((r) => !r.issue).length, 1);
  const r = commitImport(
    s,
    w.id,
    rows,
    "Batch",
    "sample.csv",
    "a".repeat(64),
    [],
  );
  assert.deepEqual(
    [
      r.total,
      r.added,
      r.duplicates,
      r.invalid,
      r.suppressed,
      r.skipped,
      r.reviewRequired,
    ],
    [4, 1, 1, 1, 1, 3, 1],
  );
  assert.equal(w.contacts.at(-1)!.status, "Lead");
  assert.equal(w.contacts.at(-1)!.consent, "");
  assert.throws(
    () =>
      commitImport(s, w.id, rows, "Again", "renamed.csv", "a".repeat(64), []),
    /already been imported/,
  );
  assert.throws(
    () =>
      commitImport(s, w.id, rows, "Bad tags", "sample.csv", "b".repeat(64), [
        "Foreign",
      ]),
    /owned/,
  );
});
test("file reading checks actual content, encoding, size and workbook structure", async () => {
  const good = await readContactFile(
    new File(["name,phone\nJamie,2025550120"], "sample.csv"),
  );
  assert.equal(good.rows.length, 2);
  assert.equal(good.fingerprint.length, 64);
  await assert.rejects(
    readContactFile(new File(["<html>fake</html>"], "fake.csv")),
    /not a CSV/,
  );
  await assert.rejects(
    readContactFile(new File([new Uint8Array([0xff, 0xfe, 0])], "bad.csv")),
    /UTF-8/,
  );
  await assert.rejects(
    readContactFile(new File(["name,phone\na,123"], "fake.xlsx")),
    /not an XLSX/,
  );
  await assert.rejects(
    readContactFile(
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.csv"),
    ),
    /5 MB/,
  );
  assert.throws(() => validateWorkbook(new Uint8Array(30)), /not an XLSX/);
});
