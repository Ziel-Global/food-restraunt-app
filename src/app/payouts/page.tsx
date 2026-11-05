"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { Badge, Button, PageTitle, Panel, StatCard, Table, Cell } from "@/components/ui";

type StatementLine = { label: string; amount: string; note?: string };

type PayoutStatement = {
  ref: string;
  period: string;
  gross: string;
  commission: string;
  commissionAmount: string;
  adjustment: string;
  net: string;
  status: string;
  paidOn?: string;
  orders: number;
  lines: StatementLine[];
};

const payouts: PayoutStatement[] = [
  {
    ref: "RP-73081",
    period: "Oct 20 – Oct 26",
    gross: "184,200",
    commission: "Configured per agreement",
    commissionAmount: "33,156",
    adjustment: "—",
    net: "Pending",
    status: "Processing",
    orders: 148,
    lines: [
      { label: "Gross sales", amount: "184,200" },
      { label: "Delivery commission (18%)", amount: "-28,440" },
      { label: "Pickup commission (12%)", amount: "-4,716" },
      { label: "Promotional subsidies", amount: "+0", note: "None this week" },
      { label: "Refunds / adjustments", amount: "0" },
      { label: "Net payout", amount: "151,044", note: "Transfer scheduled Nov 03" },
    ],
  },
  {
    ref: "RP-73062",
    period: "Oct 13 – Oct 19",
    gross: "210,500",
    commission: "Configured per agreement",
    commissionAmount: "37,890",
    adjustment: "—",
    net: "168,400",
    status: "Paid",
    paidOn: "Oct 28, 2026",
    orders: 171,
    lines: [
      { label: "Gross sales", amount: "210,500" },
      { label: "Delivery commission (18%)", amount: "-32,940" },
      { label: "Pickup commission (12%)", amount: "-4,950" },
      { label: "Promotional subsidies", amount: "+0" },
      { label: "Refunds / adjustments", amount: "0" },
      { label: "Net payout", amount: "168,400", note: "Sent to •••• 4820" },
    ],
  },
  {
    ref: "RP-73044",
    period: "Oct 06 – Oct 12",
    gross: "196,880",
    commission: "Configured per agreement",
    commissionAmount: "35,438",
    adjustment: "Refund · 1,200",
    net: "157,304",
    status: "Paid",
    paidOn: "Oct 21, 2026",
    orders: 159,
    lines: [
      { label: "Gross sales", amount: "196,880" },
      { label: "Delivery commission (18%)", amount: "-30,420" },
      { label: "Pickup commission (12%)", amount: "-5,018" },
      { label: "Promotional subsidies", amount: "+0" },
      { label: "Refunds / adjustments", amount: "-1,200", note: "Order FD-1988 quality refund" },
      { label: "Net payout", amount: "157,304", note: "Sent to •••• 4820" },
    ],
  },
];

export default function PayoutsPage() {
  const [selected, setSelected] = useState<PayoutStatement | null>(null);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Finance"
        title="Payouts & statements"
        description="Review gross sales, platform commission, adjustments, and net transfers to your bank account."
        action={<Button variant="secondary">Download statement ↓</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Next payout" value="147,360" tone="lime" icon={<Icons.payouts size={14} />} />
        <StatCard label="Next transfer" value="Nov 03" tone="ink" icon={<Icons.clock size={14} />} />
        <StatCard label="Cash orders" value="18,240" tone="orange" icon={<Icons.orders size={14} />} />
      </div>

      <Panel title="Payout statements" description="Weekly settlement history">
        <Table headers={["Statement", "Period", "Gross sales", "Commission", "Adjustments", "Net payout", "Status", ""]}>
          {payouts.map((row) => (
            <tr key={row.ref}>
              <Cell>
                <span className="font-bold text-ink">{row.ref}</span>
              </Cell>
              <Cell>{row.period}</Cell>
              <Cell className="font-semibold text-ink">{row.gross}</Cell>
              <Cell>{row.commission}</Cell>
              <Cell>{row.adjustment}</Cell>
              <Cell className="font-bold text-ink">{row.net}</Cell>
              <Cell>
                <Badge label={row.status} />
              </Cell>
              <Cell>
                <button
                  type="button"
                  onClick={() => setSelected(row)}
                  className="text-[12px] font-bold text-ink hover:underline"
                >
                  View
                </button>
              </Cell>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Bank account" description="Payout destination">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-lime">
              <Icons.payouts size={16} />
            </span>
            <span>
              <span className="block text-[13px] font-bold text-ink">Olive & Thyme Holdings</span>
              <span className="mt-1 block text-[12px] text-muted">•••• •••• 4820 · Verified</span>
            </span>
          </div>
          <Button variant="secondary" href="/settings">
            Manage bank details
          </Button>
        </div>
      </Panel>

      <p className="text-[12px] leading-5 text-soft">
        The commission rate is set in your partner agreement. Contact platform support if the statement does not match
        your contract.
      </p>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close statement"
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="statement-title"
            className="relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-card shadow-[0_32px_100px_rgba(17,17,17,0.28)] animate-fade-up sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(180deg,#fbfef4_0%,#ffffff_100%)] px-5 py-5 sm:px-7">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Statement
                </p>
                <h2 id="statement-title" className="font-display mt-3 text-[24px] font-bold tracking-tight text-ink">
                  {selected.ref}
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  {selected.period} · {selected.orders} completed orders
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-xl border border-line text-ink transition hover:bg-surface"
              >
                <Icons.close size={16} />
              </button>
            </div>

            <div className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-surface px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Gross sales</p>
                  <p className="font-display mt-1 text-[22px] font-bold text-ink">{selected.gross}</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Commission</p>
                  <p className="font-display mt-1 text-[22px] font-bold text-ink">{selected.commissionAmount}</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Net payout</p>
                  <p className="font-display mt-1 text-[22px] font-bold text-ink">{selected.net}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-ink text-lime">
                    {selected.status === "Paid" ? <Icons.check size={15} /> : <Icons.clock size={15} />}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">
                      {selected.status === "Paid" ? `Paid on ${selected.paidOn}` : "Payout in processing"}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      Destination · Olive & Thyme Holdings · •••• 4820
                    </p>
                  </div>
                </div>
                <Badge label={selected.status} />
              </div>

              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="border-b border-line bg-surface px-4 py-3">
                  <p className="text-[13px] font-bold text-ink">Settlement breakdown</p>
                  <p className="mt-0.5 text-[12px] text-muted">All amounts in configured local currency</p>
                </div>
                <div className="divide-y divide-line">
                  {selected.lines.map((line) => (
                    <div key={line.label} className="flex items-start justify-between gap-4 px-4 py-3.5">
                      <div>
                        <p className="text-[13px] font-semibold text-ink">{line.label}</p>
                        {line.note ? <p className="mt-0.5 text-[11px] text-muted">{line.note}</p> : null}
                      </div>
                      <p
                        className={`shrink-0 text-[13px] font-bold tabular-nums ${
                          line.amount.startsWith("-")
                            ? "text-orange"
                            : line.label === "Net payout"
                              ? "text-ink"
                              : "text-ink"
                        }`}
                      >
                        {line.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[12px] font-bold text-muted hover:text-ink"
              >
                Close
              </button>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                <Icons.download size={14} /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
