"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { useRestaurantWorkspace } from "@/components/restaurant-context";
import { Button, Notice, PageTitle, Panel, SelectPill, TimeField } from "@/components/ui";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function HoursPage() {
  const { accepting, setAccepting, busyExtraMinutes, setBusyExtraMinutes } = useRestaurantWorkspace();
  const [days, setDays] = useState(
    dayNames.map((day, index) => ({
      day,
      open: index !== 0,
      from: index === 5 || index === 6 ? "10:00" : "11:00",
      to: index === 5 || index === 6 ? "23:00" : "22:00",
    })),
  );
  const [notice, setNotice] = useState("");
  const openDays = days.filter((day) => day.open).length;

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Service"
        title="Hours & availability"
        description="Set your weekly schedule, pause new orders, or add prep time when the kitchen gets busy."
        action={
          <Button
            onClick={() =>
              setNotice("Hours saved in the preview. Connect the restaurant settings endpoint to persist changes.")
            }
          >
            Save schedule
          </Button>
        }
      />

      {notice ? <Notice>{notice}</Notice> : null}

      <Panel title="Accepting orders" description="Customers can place orders only while your restaurant is accepting">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-11 place-items-center rounded-2xl ${
                accepting ? "bg-ink text-lime" : "bg-[#fff1e9] text-orange"
              }`}
            >
              {accepting ? <Icons.check size={18} /> : <Icons.pause size={16} />}
            </span>
            <span>
              <span className="block text-[14px] font-bold text-ink">
                {accepting ? "Your restaurant is open for orders" : "New orders are paused"}
              </span>
              <span className="mt-1 block text-[12px] text-muted">
                Pausing won’t affect orders already being prepared.
              </span>
            </span>
          </div>
          <button
            type="button"
            aria-label={accepting ? "Pause orders" : "Resume orders"}
            onClick={() => setAccepting(!accepting)}
            className={`relative h-7 w-12 rounded-full transition ${accepting ? "bg-ink" : "bg-line-strong"}`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full transition-all ${
                accepting ? "left-6 bg-lime" : "left-1 bg-white"
              }`}
            />
          </button>
        </div>
      </Panel>

      <Panel
        title="Weekly opening hours"
        description="Times are shown in Central City local time"
        action={
          <span className="rounded-full bg-lime-soft px-3 py-1.5 text-[11px] font-bold text-ink">
            {openDays} open · {7 - openDays} closed
          </span>
        }
      >
        <div className="divide-y divide-line">
          {days.map((entry, index) => (
            <div
              key={entry.day}
              className="grid items-center gap-4 px-5 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:px-6"
            >
              <button
                type="button"
                onClick={() =>
                  setDays((current) =>
                    current.map((day, i) => (i === index ? { ...day, open: !day.open } : day)),
                  )
                }
                className="flex items-center gap-3 text-left"
              >
                <span
                  className={`grid size-6 place-items-center rounded-lg transition ${
                    entry.open ? "bg-ink text-lime" : "bg-surface text-transparent ring-1 ring-line"
                  }`}
                >
                  <Icons.check size={13} />
                </span>
                <span>
                  <span className="block text-[13px] font-bold text-ink">{entry.day}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">{entry.open ? "Open" : "Closed"}</span>
                </span>
              </button>

              {entry.open ? (
                <div className="flex flex-wrap items-end gap-3">
                  <TimeField
                    label="Opens"
                    value={entry.from}
                    onChange={(from) =>
                      setDays((current) => current.map((day, i) => (i === index ? { ...day, from } : day)))
                    }
                    className="min-w-[160px] flex-1 sm:flex-none"
                  />
                  <span className="mb-3 hidden text-[12px] font-semibold text-soft sm:inline">to</span>
                  <TimeField
                    label="Closes"
                    value={entry.to}
                    onChange={(to) =>
                      setDays((current) => current.map((day, i) => (i === index ? { ...day, to } : day)))
                    }
                    className="min-w-[160px] flex-1 sm:flex-none"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-3 text-[12px] text-muted">
                  Marked as closed for the full day
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Busy mode" description="Increase the customer’s estimated wait without pausing the restaurant">
        <div className="p-5">
          <p className="text-[13px] text-muted">Add extra preparation time to incoming orders</p>
          <div className="mt-4">
            <SelectPill
              options={["Off", "+10 min", "+15 min", "+20 min", "+30 min"]}
              selected={busyExtraMinutes === 0 ? "Off" : `+${busyExtraMinutes} min`}
              onSelect={(option) => setBusyExtraMinutes(option === "Off" ? 0 : Number(option.replace(/\D/g, "")))}
            />
          </div>
          <p className="mt-3 text-[12px] text-soft">
            Current prep estimate will include{" "}
            {busyExtraMinutes ? `${busyExtraMinutes} extra minutes` : "no extra time"}.
          </p>
        </div>
      </Panel>

      <Panel
        title="Special closures"
        description="Schedule a holiday or one-time closure"
        action={<Button variant="secondary">Add closure +</Button>}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-lime">
              <Icons.clock size={16} />
            </span>
            <span>
              <span className="block text-[13px] font-bold text-ink">No upcoming closures</span>
              <span className="mt-1 block text-[12px] text-muted">
                Add a date to pause orders outside your regular schedule.
              </span>
            </span>
          </div>
          <button type="button" className="text-[12px] font-bold text-ink hover:underline">
            Add a date →
          </button>
        </div>
      </Panel>
    </div>
  );
}
