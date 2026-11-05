"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { Button, Notice, PageTitle, Panel, Person, SelectField, StatCard, Table, Cell } from "@/components/ui";

type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  role: string;
  status: string;
  initials: string;
  notes?: string;
};

const TEAM_STORAGE_KEY = "crave.restaurant.team.v1";

const initial: Staff[] = [
  {
    id: "S-01",
    name: "Mina Patel",
    email: "mina@oliveandthyme.example",
    phone: "+1 555 014 1001",
    address: "42 Grove Avenue",
    city: "Central City",
    role: "Owner",
    status: "Active",
    initials: "MP",
  },
  {
    id: "S-02",
    name: "Ibrahim Saleh",
    email: "ibrahim@oliveandthyme.example",
    phone: "+1 555 014 1188",
    address: "19 Cedar Lane",
    city: "Central City",
    role: "Manager",
    status: "Active",
    initials: "IS",
  },
  {
    id: "S-03",
    name: "Elena Cruz",
    email: "elena@oliveandthyme.example",
    phone: "+1 555 014 1320",
    address: "88 Harbor Road",
    city: "Central City",
    role: "Staff",
    status: "Active",
    initials: "EC",
  },
];

const roleDetails: Record<string, string> = {
  Staff: "Can manage orders and menu availability.",
  Manager: "Can manage team, hours, and day-to-day operations.",
  Owner: "Full access including payouts, documents, and team management.",
};

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "Central City",
  role: "Staff",
  notes: "",
};

function loadTeam(): Staff[] {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Staff[];
    return Array.isArray(parsed) && parsed.length ? parsed : initial;
  } catch {
    return initial;
  }
}

function persistTeam(next: Staff[]) {
  try {
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* keep UI working */
  }
}

function makeInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NA"
  );
}

export default function TeamPage() {
  const [rows, setRows] = useState<Staff[]>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setRows(loadTeam());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistTeam(rows);
  }, [rows, hydrated]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  function addStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();
    const city = form.city.trim();

    if (!name || !email || !phone || !address || !city) return;

    const nextMember: Staff = {
      id: `S-${Date.now()}`,
      name,
      email,
      phone,
      address,
      city,
      role: form.role,
      status: "Active",
      initials: makeInitials(name),
      notes: form.notes.trim() || undefined,
    };

    setRows((current) => {
      const next = [nextMember, ...current];
      persistTeam(next);
      return next;
    });
    setMessage(`${name} added to your team and saved locally.`);
    closeModal();
  }

  const canSave =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.city.trim();

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Team"
        title="Team access"
        description="Add staff with their contact details and home address so your kitchen roster stays complete."
        action={<Button onClick={() => setOpen(true)}>Add staff +</Button>}
      />

      {message ? <Notice>{message}</Notice> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Team members" value={String(rows.length)} icon={<Icons.team size={14} />} />
        <StatCard
          label="Managers & owners"
          value={String(rows.filter((r) => r.role === "Owner" || r.role === "Manager").length)}
          icon={<Icons.settings size={14} />}
        />
        <StatCard
          label="Active staff"
          value={String(rows.filter((r) => r.status === "Active").length)}
          icon={<Icons.check size={14} />}
        />
      </div>

      <Panel title="Restaurant team" description="Full contact details for everyone on the floor">
        <Table headers={["Member", "Phone", "Home address", "Access role", "Status", ""]}>
          {rows.map((person) => (
            <tr key={person.id}>
              <Cell>
                <Person initials={person.initials} name={person.name} meta={person.email} />
              </Cell>
              <Cell className="font-semibold text-ink">{person.phone}</Cell>
              <Cell>
                <span className="block text-[13px] font-semibold text-ink">{person.address}</span>
                <span className="mt-0.5 block text-[11px] text-muted">{person.city}</span>
              </Cell>
              <Cell>{person.role}</Cell>
              <Cell>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    person.status === "Active" ? "bg-lime-soft text-ink" : "bg-[#fff3e6] text-[#a76225]"
                  }`}
                >
                  {person.status}
                </span>
              </Cell>
              <Cell>
                <button className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-ink" aria-label="More">
                  <Icons.more size={16} />
                </button>
              </Cell>
            </tr>
          ))}
        </Table>
      </Panel>

      <div className="rounded-2xl border border-line bg-surface p-4 text-[12px] leading-5 text-muted">
        Keep phone and home address on file for scheduling and emergencies. Owner access is required for payouts and
        documents.
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close add staff"
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={closeModal}
          />

          <form
            onSubmit={addStaff}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-staff-title"
            className="relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-card shadow-[0_32px_100px_rgba(17,17,17,0.28)] animate-fade-up sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(180deg,#fbfef4_0%,#ffffff_100%)] px-5 py-5 sm:px-7">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Team roster
                </p>
                <h2 id="add-staff-title" className="font-display mt-3 text-[24px] font-bold tracking-tight text-ink">
                  Add staff
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Capture their name, contact number, home address, and access role.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-xl border border-line text-ink transition hover:bg-surface"
              >
                <Icons.close size={16} />
              </button>
            </div>

            <div className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[12px] font-bold text-ink sm:col-span-2">
                  Full name
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <label className="block text-[12px] font-bold text-ink">
                  Work email
                  <input
                    required
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    type="email"
                    placeholder="staff@example.com"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <label className="block text-[12px] font-bold text-ink">
                  Phone number
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    type="tel"
                    placeholder="+1 555 000 0000"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <label className="block text-[12px] font-bold text-ink sm:col-span-2">
                  Home address
                  <input
                    required
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    placeholder="Street and building number"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <label className="block text-[12px] font-bold text-ink">
                  City
                  <input
                    required
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    placeholder="Central City"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <SelectField
                  label="Access role"
                  value={form.role}
                  options={["Staff", "Manager"]}
                  onChange={(value) => updateForm("role", value)}
                />

                <label className="block text-[12px] font-bold text-ink sm:col-span-2">
                  Notes <span className="font-medium text-muted">(optional)</span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    rows={3}
                    placeholder="Shift preference, emergency contact, or anything useful for the kitchen"
                    className="mt-2 w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-line bg-surface px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-ink text-lime">
                    <Icons.team size={15} />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-ink">{form.role} access</p>
                    <p className="mt-1 text-[12px] leading-5 text-muted">{roleDetails[form.role]}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-7">
              <button type="button" onClick={closeModal} className="text-[12px] font-bold text-muted hover:text-ink">
                Cancel
              </button>
              <Button type="submit" disabled={!canSave}>
                Add staff member
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
