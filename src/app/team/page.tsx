"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { Button, Notice, PageTitle, Panel, Person, SelectField, StatCard, Table, Cell } from "@/components/ui";

type Staff = { name: string; email: string; role: string; status: string; initials: string };

const initial: Staff[] = [
  { name: "Mina Patel", email: "mina@oliveandthyme.example", role: "Owner", status: "Active", initials: "MP" },
  { name: "Ibrahim Saleh", email: "ibrahim@oliveandthyme.example", role: "Manager", status: "Active", initials: "IS" },
  { name: "Elena Cruz", email: "elena@oliveandthyme.example", role: "Staff", status: "Invite pending", initials: "EC" },
];

const roleDetails: Record<string, string> = {
  Staff: "Can manage orders and menu availability.",
  Manager: "Can manage team invites, hours, and day-to-day operations.",
};

export default function TeamPage() {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Staff");

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

  function resetForm() {
    setEmail("");
    setFullName("");
    setRole("Staff");
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const derived =
      fullName.trim() ||
      email
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (x) => x.toUpperCase());
    const initials = derived
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setRows((current) => [
      ...current,
      {
        name: derived,
        email: email.trim(),
        role,
        status: "Invite pending",
        initials: initials || "NA",
      },
    ]);
    setMessage(`Invitation sent to ${email.trim()} in this preview.`);
    closeModal();
  }

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Team"
        title="Team access"
        description="Invite staff and give each person the access they need to run the restaurant."
        action={<Button onClick={() => setOpen(true)}>Invite staff +</Button>}
      />

      {message ? <Notice>{message}</Notice> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Team members" value={String(rows.length)} icon={<Icons.team size={14} />} />
        <StatCard
          label="Owners"
          value={String(rows.filter((r) => r.role === "Owner").length)}
          icon={<Icons.settings size={14} />}
        />
        <StatCard
          label="Invitations pending"
          value={String(rows.filter((r) => r.status === "Invite pending").length)}
          tone="orange"
          icon={<Icons.bell size={14} />}
        />
      </div>

      <Panel title="Restaurant team" description="Owners can invite staff and managers">
        <Table headers={["Member", "Access role", "Status", ""]}>
          {rows.map((person) => (
            <tr key={person.email}>
              <Cell>
                <Person initials={person.initials} name={person.name} meta={person.email} />
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
        Staff can manage orders and menu availability. Owner access is required for team, bank details and payout settings.
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close invite staff"
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={closeModal}
          />

          <form
            onSubmit={invite}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-staff-title"
            className="relative z-10 flex w-full max-w-[520px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-card shadow-[0_32px_100px_rgba(17,17,17,0.28)] animate-fade-up sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(180deg,#fbfef4_0%,#ffffff_100%)] px-5 py-5 sm:px-7">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Team access
                </p>
                <h2 id="invite-staff-title" className="font-display mt-3 text-[24px] font-bold tracking-tight text-ink">
                  Invite staff
                </h2>
                <p className="mt-1 text-[13px] text-muted">Send access to someone who helps run Olive & Thyme.</p>
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

            <div className="space-y-4 px-5 py-5 sm:px-7">
              <label className="block text-[12px] font-bold text-ink">
                Full name
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                />
              </label>

              <label className="block text-[12px] font-bold text-ink">
                Work email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="staff@example.com"
                  className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                />
              </label>

              <SelectField label="Access role" value={role} options={["Staff", "Manager"]} onChange={setRole} />

              <div className="rounded-2xl border border-line bg-surface px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-ink text-lime">
                    <Icons.team size={15} />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-ink">{role} access</p>
                    <p className="mt-1 text-[12px] leading-5 text-muted">{roleDetails[role]}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-7">
              <button type="button" onClick={closeModal} className="text-[12px] font-bold text-muted hover:text-ink">
                Cancel
              </button>
              <Button type="submit" disabled={!email.trim()}>
                Send invitation
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
