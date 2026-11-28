"use client";
import { useState } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { type Workspace, type Contact } from "@/lib/model";
import { useStore } from "@/lib/store";
import {
  saveContact,
  deleteContact,
  tagNames,
  assignTag,
} from "./contact-domain";
export function ContactEditor({
  w,
  contact,
  onClose,
}: {
  w: Workspace;
  contact?: Contact;
  onClose: () => void;
}) {
  const { mutate } = useStore();
  const [first, setFirst] = useState(contact?.firstName || ""),
    [phone, setPhone] = useState(contact?.phone || ""),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false);
  return (
    <Modal
      open
      title={contact ? "Contact details" : "Add contact"}
      onClose={onClose}
    >
      {error && <p role="alert">{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            mutate((s) => saveContact(s, w.id, first, phone, contact?.id));
            onClose();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Input
          label="First Name"
          maxLength={100}
          value={first}
          onChange={(e) => setFirst(e.target.value)}
        />
        <Input
          label="Phone Number"
          type="tel"
          required
          value={phone}
          readOnly={!!contact}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p>
          {contact
            ? "Phone changes require a new contact so consent cannot transfer to another person."
            : "Adding a contact does not grant messaging consent."}
        </p>
        <Button type="submit">Save contact</Button>
      </form>
      {contact && (
        <>
          <p>
            Status: {contact.status}. Consent evidence:{" "}
            {contact.consent || "Not recorded"}.
          </p>
          <fieldset>
            <legend>Workspace tags</legend>
            {tagNames(w).map((t) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={contact.tags.includes(t)}
                  onChange={(e) => {
                    try {
                      mutate((s) =>
                        assignTag(s, w.id, [contact.id], t, !e.target.checked),
                      );
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                />{" "}
                {t}{" "}
              </label>
            ))}
          </fieldset>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Delete contact
          </Button>
          {confirm && (
            <section aria-label="Confirm contact removal">
              <p>
                Remove this contact from the active list? Consent, opt-outs and
                message history are retained.
              </p>
              <Button
                variant="danger"
                onClick={() => {
                  try {
                    mutate((s) => deleteContact(s, w.id, contact.id));
                    onClose();
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Confirm delete
              </Button>
              <Button variant="quiet" onClick={() => setConfirm(false)}>
                Keep contact
              </Button>
            </section>
          )}
        </>
      )}
    </Modal>
  );
}
export function TagManager({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState<string[]>([]),
    [tag, setTag] = useState(""),
    [name, setName] = useState(""),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState(""),
    [removing, setRemoving] = useState(false);
  function act(fn: Parameters<typeof mutate>[0]) {
    try {
      mutate(fn);
      setNotice("Demo tags updated.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  const names = tagNames(w);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Manage tags
      </Button>
      <Modal open={open} title="Workspace tags" onClose={() => setOpen(false)}>
        <p>
          Tags belong to this demo workspace. Changing tags never changes
          consent.
        </p>
        {notice && <p role="status">{notice}</p>}
        <Input
          label="Search tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Select tag"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            setName(e.target.value);
            setRemoving(false);
          }}
        >
          <option value="">Create a new tag</option>
          {names
            .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
            .map((t) => (
              <option key={t}>{t}</option>
            ))}
        </Select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act((s) => saveTag(s, w.id, name, tag || undefined));
          }}
        >
          <Input
            label="Tag name"
            maxLength={40}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit">{tag ? "Rename tag" : "Create tag"}</Button>
        </form>
        <Button
          variant="danger"
          disabled={!tag}
          onClick={() => setRemoving(true)}
        >
          Delete tag
        </Button>
        {removing && (
          <div>
            <p>Remove “{tag}” from this workspace and all its contacts?</p>
            <Button
              variant="danger"
              onClick={() => {
                act((s) => deleteTag(s, w.id, tag));
                setTag("");
                setName("");
                setRemoving(false);
              }}
            >
              Confirm tag deletion
            </Button>
          </div>
        )}
        <fieldset className="bulk-contact-list">
          <legend>Select contacts for bulk tagging</legend>
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
              />{" "}
              {c.firstName || c.phone}
            </label>
          ))}
        </fieldset>
        <div className="actions">
          <Button
            disabled={!tag || !selected.length}
            onClick={() => act((s) => assignTag(s, w.id, selected, tag))}
          >
            Assign tag to selected
          </Button>
          <Button
            variant="secondary"
            disabled={!tag || !selected.length}
            onClick={() => act((s) => assignTag(s, w.id, selected, tag, true))}
          >
            Remove tag from selected
          </Button>
        </div>
      </Modal>
    </>
  );
}
import { saveTag, deleteTag } from "./contact-domain";
