"use client";
import { useState } from "react";
import {
  type Workspace,
  type Thread,
  workspace,
  setContactStatus,
} from "@/lib/model";
import { useStore } from "@/lib/store";
import { Button, Input, Modal, Select } from "@/components/ui";
export function InboxTools({
  w,
  thread,
  onReply,
}: {
  w: Workspace;
  thread: Thread;
  onReply: (text: string) => void;
}) {
  const { mutate } = useStore();
  const [note, setNote] = useState(""),
    [tag, setTag] = useState(""),
    [confirm, setConfirm] = useState(false),
    [reason, setReason] = useState(""),
    [feedback, setFeedback] = useState("");
  const contact = w.contacts.find((c) => c.id === thread.contactId)!;
  function edit(fn: (t: Thread) => void) {
    try {
      mutate((s) =>
        fn(workspace(s, w.id).threads.find((t) => t.id === thread.id)!),
      );
    } catch (e) {
      setFeedback((e as Error).message);
    }
  }
  const replies = w.preview?.templates || [
    {
      id: "welcome",
      name: "Welcome",
      text: "Thanks for reaching out. How can we help?",
    },
    {
      id: "appointment",
      name: "Appointment follow-up",
      text: "Happy to help with your booking. Which day works best?",
    },
  ];
  return (
    <details className="thread-tools">
      <summary>Contact details & team tools</summary>
      <div className="thread-tools-grid">
        <section>
          <h3>{contact.firstName}</h3>
          <p>{contact.phone}</p>
          <p>Consent: {contact.consent || "No evidence recorded"}</p>
          <p>Tags: {contact.tags.join(", ") || "None"}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tag.trim()) return;
              mutate((s) => {
                const c = workspace(s, w.id).contacts.find(
                  (c) => c.id === contact.id,
                )!;
                c.tags = Array.from(new Set([...c.tags, tag.trim()]));
              });
              setTag("");
            }}
          >
            <Input
              label="New contact tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              maxLength={40}
            />
            <Button type="submit" variant="secondary">
              Add tag
            </Button>
          </form>
          <Button
            variant="danger"
            disabled={contact.status === "Opted out"}
            onClick={() => setConfirm(true)}
          >
            Suppress contact
          </Button>
        </section>
        <section>
          <Select
            label="Assigned teammate"
            value={thread.assignee || ""}
            onChange={(e) =>
              edit((t) => {
                t.assignee = e.target.value;
              })
            }
          >
            <option value="">Unassigned</option>
            <option value={w.email}>{w.email} (owner)</option>
            {w.members
              .filter((m) => m.email !== w.email)
              .map((m) => (
                <option key={m.id} value={m.email}>
                  {m.email}
                </option>
              ))}
          </Select>
          <Select
            label="Saved replies and templates"
            defaultValue=""
            onChange={(e) => {
              const reply = replies.find((r) => r.id === e.target.value);
              if (reply) onReply(reply.text);
              e.target.value = "";
            }}
          >
            <option value="">Insert a saved reply</option>
            {replies.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              edit((t) => {
                t.notes = [
                  ...(t.notes || []),
                  {
                    id: crypto.randomUUID(),
                    text: note.trim(),
                    at: new Date().toISOString(),
                    author: w.email,
                  },
                ];
              });
              setNote("");
            }}
          >
            <Input
              label="Internal note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              maxLength={1000}
            />
            <Button variant="secondary" type="submit">
              Add internal note
            </Button>
          </form>
          {thread.notes?.map((n) => (
            <div className="internal-note" key={n.id}>
              <b>{n.author}</b>
              <p>{n.text}</p>
              <small>Internal only · {new Date(n.at).toLocaleString()}</small>
            </div>
          ))}
        </section>
      </div>
      <label className="field">
        Attachment preview
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (
              f.size > 2 * 1024 * 1024 ||
              ![
                "image/png",
                "image/jpeg",
                "image/webp",
                "application/pdf",
              ].includes(f.type)
            ) {
              setFeedback("Choose a PNG, JPEG, WebP or PDF of 2 MB or less.");
              return;
            }
            edit((t) => {
              t.attachment = { name: f.name, size: f.size };
            });
            setFeedback(
              "Attachment metadata saved for preview only. MMS upload and delivery are not connected.",
            );
            e.target.value = "";
          }}
        />
      </label>
      {thread.attachment && (
        <p>
          {thread.attachment.name} · {Math.ceil(thread.attachment.size / 1024)}{" "}
          KB{" "}
          <Button
            variant="quiet"
            onClick={() =>
              edit((t) => {
                delete t.attachment;
              })
            }
          >
            Remove attachment
          </Button>
        </p>
      )}
      {feedback && <p role="status">{feedback}</p>}
      <Modal
        title="Suppress this contact?"
        open={confirm}
        onClose={() => setConfirm(false)}
      >
        <p>
          This demo will block messaging to this number across the workspace. Do
          not confuse suppression with a temporary delivery failure.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate((s) => {
              setContactStatus(s, w.id, contact.id, "Opted out");
              const t = workspace(s, w.id).threads.find(
                (t) => t.id === thread.id,
              )!;
              t.notes = [
                ...(t.notes || []),
                {
                  id: crypto.randomUUID(),
                  at: new Date().toISOString(),
                  author: w.email,
                  text: "Suppression reason: " + reason.trim(),
                },
              ];
            });
            setConfirm(false);
            setReason("");
          }}
        >
          <Input
            label="Suppression reason"
            required
            minLength={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button type="submit" variant="danger">
            Confirm suppression
          </Button>
        </form>
      </Modal>
    </details>
  );
}
