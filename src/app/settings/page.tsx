"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { Button, Notice, PageTitle, Panel, SelectField } from "@/components/ui";

const agreementSections = [
  {
    title: "1. Parties",
    body: "This Partner Restaurant Agreement is between Crave Operations Ltd. (“Crave”) and Olive & Thyme Holdings (“Restaurant”), Partner ID REST-00428, operating at 128 Market Street, Central City.",
  },
  {
    title: "2. Commission & fees",
    body: "Crave charges a marketplace commission of 18% on completed delivery orders and 12% on completed pickup orders. Payment processing fees are included. Promotional subsidies funded by Crave do not increase the Restaurant’s commission rate.",
  },
  {
    title: "3. Payouts",
    body: "Settlements are paid weekly every Tuesday for the previous Sunday–Saturday period to the verified bank account on file (Olive & Thyme Holdings · •••• 4820), subject to holds for disputed or incomplete orders.",
  },
  {
    title: "4. Menu, hours & fulfillment",
    body: "The Restaurant is responsible for accurate menu pricing, allergen information, availability, and preparation times. Orders must be accepted or rejected within 2 minutes. Repeated late handoffs may affect visibility ranking.",
  },
  {
    title: "5. Customer support & refunds",
    body: "Crave provides first-line customer support. Refunds caused by Restaurant error (missing items, quality issues, wrong order) may be deducted from the next payout. Platform-side delivery failures are not charged to the Restaurant.",
  },
  {
    title: "6. Term & termination",
    body: "This agreement started on October 12, 2026 and continues until terminated by either party with 14 days’ written notice, or immediately for material breach, fraud, or food-safety violations.",
  },
];

const PROFILE_STORAGE_KEY = "crave.restaurant.profile.v1";

type Profile = {
  name: string;
  phone: string;
  cuisine: string;
  prepTime: string;
  address: string;
  city: string;
  description: string;
  accountTitle: string;
  bankLast4: string;
};

const defaultProfile: Profile = {
  name: "Olive & Thyme",
  phone: "+1 555 014 1042",
  cuisine: "Mediterranean",
  prepTime: "20",
  address: "128 Market Street",
  city: "Central City",
  description: "Seasonal Mediterranean plates, made fresh in our Central City kitchen.",
  accountTitle: "Olive & Thyme Holdings",
  bankLast4: "4820",
};

function loadProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    return defaultProfile;
  }
}

export default function RestaurantSettingsPage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!agreementOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAgreementOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [agreementOpen]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setSaved(false);
  }

  function save() {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* keep UI working if storage is full */
    }
    setSaved(true);
    setDirty(false);
  }

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Profile"
        title="Restaurant profile"
        description="This restaurant is already live. Review the filled storefront details and edit anything that needs updating."
        action={
          <Button onClick={save} disabled={!hydrated || (!dirty && saved)}>
            {saved && !dirty ? "Saved" : "Save changes"}
          </Button>
        }
      />

      {saved ? <Notice>Profile changes saved locally for Olive & Thyme.</Notice> : null}
      {dirty && !saved ? (
        <p className="rounded-xl border border-[#ffd7c2] bg-[#fff6ef] px-4 py-3 text-[12px] font-semibold text-[#98613d]">
          You have unsaved edits.
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Storefront details" description="Pre-filled from your live restaurant · editable anytime">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="block text-[12px] font-bold text-ink">
              Restaurant name
              <input
                value={profile.name}
                onChange={(e) => update("name", e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
              />
            </label>

            <label className="block text-[12px] font-bold text-ink">
              Phone
              <input
                value={profile.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
              />
            </label>

            <SelectField
              label="Cuisine"
              value={profile.cuisine}
              options={["Mediterranean", "American", "Asian", "Italian", "Mexican", "Healthy", "Other"]}
              onChange={(value) => update("cuisine", value)}
            />

            <label className="block text-[12px] font-bold text-ink">
              Average preparation time
              <div className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4">
                <input
                  value={profile.prepTime}
                  onChange={(e) => update("prepTime", e.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  className="w-full bg-transparent text-[13px] font-normal outline-none"
                />
                <span className="shrink-0 text-[12px] font-semibold text-muted">minutes</span>
              </div>
            </label>

            <label className="block text-[12px] font-bold text-ink">
              Street address
              <input
                value={profile.address}
                onChange={(e) => update("address", e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
              />
            </label>

            <label className="block text-[12px] font-bold text-ink">
              City
              <input
                value={profile.city}
                onChange={(e) => update("city", e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
              />
            </label>

            <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-3 sm:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Minimum order</p>
              <p className="mt-1 text-[13px] font-semibold text-ink">Set by platform rules</p>
              <p className="mt-1 text-[11px] text-soft">Managed by Crave · not editable here</p>
            </div>

            <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-3 sm:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Delivery radius</p>
              <p className="mt-1 text-[13px] font-semibold text-ink">Configured by delivery zone</p>
              <p className="mt-1 text-[11px] text-soft">Managed by Crave · not editable here</p>
            </div>

            <label className="block text-[12px] font-bold text-ink sm:col-span-2">
              Description
              <textarea
                value={profile.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
              />
            </label>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Restaurant status" description="Platform approval and listing">
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2 rounded-xl bg-lime-soft px-3 py-3 text-[12px] font-bold text-ink">
                <span className="size-2 rounded-full bg-lime-deep" />
                Active and visible to customers
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted">Application approved</span>
                <span className="font-semibold text-ink">Oct 12, 2026</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted">Partner ID</span>
                <span className="font-semibold text-ink">REST-00428</span>
              </div>
            </div>
          </Panel>

          <Panel title="Business documents" description="Required licenses and registration">
            <div className="divide-y divide-line">
              {[
                { label: "Business registration", state: "Verified", ok: true },
                { label: "Food safety certificate", state: "Verified", ok: true },
                { label: "Tax document", state: "Expires in 42 days", ok: false },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center justify-between gap-2 px-5 py-3.5">
                  <span className="text-[12px] font-semibold text-ink">{doc.label}</span>
                  <span className={`text-[11px] font-bold ${doc.ok ? "text-ink" : "text-orange"}`}>{doc.state}</span>
                </div>
              ))}
            </div>
            <div className="p-4">
              <Button variant="secondary">
                <Icons.upload size={14} /> Upload document
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Payout details" description="Verified destination for restaurant transfers">
          <div className="space-y-4 p-5">
            <label className="block text-[12px] font-bold text-ink">
              Account title
              <input
                value={profile.accountTitle}
                onChange={(e) => update("accountTitle", e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
              />
            </label>
            <label className="block text-[12px] font-bold text-ink">
              Bank account (last 4)
              <div className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4">
                <span className="text-[13px] text-muted">•••• ••••</span>
                <input
                  value={profile.bankLast4}
                  onChange={(e) => update("bankLast4", e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                  inputMode="numeric"
                  className="w-full bg-transparent text-[13px] font-semibold outline-none"
                />
              </div>
            </label>
            <Button variant="secondary">Update payout account</Button>
          </div>
        </Panel>

        <Panel title="Partner agreement" description="Fees and operating terms">
          <div className="space-y-3 p-5">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">Commission</span>
              <span className="font-bold text-ink">18% delivery · 12% pickup</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">Payout cadence</span>
              <span className="font-bold text-ink">Weekly · Tuesdays</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">Signed</span>
              <span className="font-bold text-ink">Oct 12, 2026</span>
            </div>
            <div className="flex justify-between gap-3 text-[13px]">
              <span className="text-muted">Contract document</span>
              <button
                type="button"
                onClick={() => setAgreementOpen(true)}
                className="font-bold text-ink hover:underline"
              >
                View agreement →
              </button>
            </div>
          </div>
        </Panel>
      </div>

      {agreementOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close partner agreement"
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={() => setAgreementOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agreement-title"
            className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-[680px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-card shadow-[0_32px_100px_rgba(17,17,17,0.28)] animate-fade-up sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(180deg,#fbfef4_0%,#ffffff_100%)] px-5 py-5 sm:px-7">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Signed contract
                </p>
                <h2 id="agreement-title" className="font-display mt-3 text-[24px] font-bold tracking-tight text-ink">
                  Partner restaurant agreement
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Olive & Thyme · REST-00428 · Effective Oct 12, 2026
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAgreementOpen(false)}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-xl border border-line text-ink transition hover:bg-surface"
              >
                <Icons.close size={16} />
              </button>
            </div>

            <div className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Delivery commission", value: "18%" },
                  { label: "Pickup commission", value: "12%" },
                  { label: "Payouts", value: "Weekly" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-line bg-surface px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{item.label}</p>
                    <p className="font-display mt-1 text-[22px] font-bold text-ink">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-ink text-lime">
                      <Icons.check size={16} />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-ink">Signed by Mina Patel</p>
                      <p className="mt-0.5 text-[12px] text-muted">Restaurant owner · Oct 12, 2026 · 14:22</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-lime-soft px-3 py-1.5 text-[11px] font-bold text-ink">Active</span>
                </div>
              </div>

              <div className="space-y-3">
                {agreementSections.map((section) => (
                  <section key={section.title} className="rounded-2xl border border-line bg-surface px-4 py-4">
                    <h3 className="text-[13px] font-bold text-ink">{section.title}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-muted">{section.body}</p>
                  </section>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-7">
              <p className="text-[11px] text-soft">Document ID · CRAVE-AGR-REST-00428</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setAgreementOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setAgreementOpen(false)}>
                  <Icons.download size={14} /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
