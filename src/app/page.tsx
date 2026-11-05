"use client";

import Link from "next/link";
import { useState } from "react";
import { useRestaurantWorkspace } from "@/components/restaurant-context";
import { Icons } from "@/components/icons";
import { Badge, Button, Metric, Notice, PageTitle, Panel, Person, Table, Cell } from "@/components/ui";

export default function RestaurantOverview() {
  const { orders, setOrderStatus, accepting, setAccepting } = useRestaurantWorkspace();
  const [sound, setSound] = useState(false);
  const pending = orders.filter((order) => order.status === "New order");
  const active = orders.filter((order) => ["New order", "Preparing", "Ready for pickup"].includes(order.status));

  function alertSound() {
    try {
      const context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = 740;
      gain.gain.value = 0.06;
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
    } catch {
      /* Sound is optional on restricted browsers. */
    }
    setSound(true);
  }

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Thursday · Central City"
        title="Welcome back, Mina"
        description="Here’s your kitchen at a glance. New orders need a response within 2 minutes."
        action={
          <Button href="/menu">
            Manage menu <Icons.arrow size={14} />
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={alertSound}
          className={`rounded-xl border px-3.5 py-2.5 text-[11px] font-bold transition ${
            sound
              ? "border-line bg-lime-soft text-ink"
              : "border-line bg-card text-muted hover:text-ink"
          }`}
        >
          {sound ? "Order alert sound enabled ✓" : "Enable order alert sound"}
        </button>
      </div>

      {!accepting ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ffd7c2] bg-[#fff6ef] px-4 py-3">
          <p className="text-[12px] font-semibold text-[#98613d]">
            Orders are paused. Customers won’t be able to place new orders.
          </p>
          <Button variant="secondary" onClick={() => setAccepting(true)}>
            Resume orders
          </Button>
        </div>
      ) : null}

      {pending.length ? (
        <div className="rounded-2xl border border-[#f0d8bd] bg-[#fff7ed] p-5 shadow-[0_8px_28px_rgba(143,87,40,.06)] animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#a7652e]">
                Needs your attention · {pending.length} new
              </p>
              <h2 className="font-display mt-1 text-[17px] font-bold text-[#533a25]">A new order just came in</h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#a7652e]">
              Respond within 2:00
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4">
            <div>
              <p className="text-[13px] font-bold text-ink">
                #{pending[0].id} <span className="font-medium text-muted">· {pending[0].customer}</span>
              </p>
              <p className="mt-1 text-[12px] text-muted">
                {pending[0].items} · Total {pending[0].total} local currency
              </p>
              <p className="mt-1 text-[11px] text-soft">
                Customer note: {pending[0].note ?? "No special instructions"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => setOrderStatus(pending[0].id, "Rejected")}>
                Reject
              </Button>
              <Button onClick={() => setOrderStatus(pending[0].id, "Preparing")}>
                Accept · {pending[0].prep}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="New orders"
          value={String(pending.length)}
          caption="Waiting for your response"
          icon={<Icons.orders size={16} />}
        />
        <Metric
          label="In the kitchen"
          value={String(orders.filter((order) => order.status === "Preparing").length)}
          caption="Preparing right now"
          icon={<Icons.clock size={16} />}
        />
        <Metric
          label="Ready for pickup"
          value={String(orders.filter((order) => order.status === "Ready for pickup").length)}
          caption="Riders can collect"
          icon={<Icons.check size={16} />}
        />
        <Metric
          label="Today’s sales"
          value="28,450"
          caption="Configured local currency"
          icon={<Icons.payouts size={16} />}
        />
      </div>

      <Panel
        title="Orders in progress"
        description="Move each order forward as your kitchen works"
        action={
          <Button variant="secondary" href="/orders">
            View order board
          </Button>
        }
      >
        {active.length ? (
          <Table headers={["Order", "Customer", "Items", "Status", "Elapsed", "Total", "Next step"]}>
            {active.map((order) => (
              <tr key={order.id}>
                <Cell>
                  <span className="font-bold text-ink">#{order.id}</span>
                </Cell>
                <Cell>
                  <Person
                    initials={order.customer
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                    name={order.customer}
                    meta="Delivery order"
                  />
                </Cell>
                <Cell>{order.items}</Cell>
                <Cell>
                  <Badge label={order.status} />
                </Cell>
                <Cell>{order.elapsed}</Cell>
                <Cell className="font-bold text-ink">{order.total}</Cell>
                <Cell>
                  {order.status === "New order" ? (
                    <Button onClick={() => setOrderStatus(order.id, "Preparing")}>Accept order</Button>
                  ) : order.status === "Preparing" ? (
                    <Button onClick={() => setOrderStatus(order.id, "Ready for pickup")}>Mark ready</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setOrderStatus(order.id, "Picked up")}>
                      Hand to rider
                    </Button>
                  )}
                </Cell>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="p-10 text-center text-[13px] text-muted">No orders need kitchen attention right now.</div>
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Menu snapshot"
          description="Popular items and current availability"
          action={
            <Button variant="ghost" href="/menu">
              Edit menu →
            </Button>
          }
        >
          <div className="divide-y divide-line">
            {[
              { name: "Chicken shawarma plate", category: "Popular · Mains", sold: "42 sold today", available: "Available" },
              { name: "Classic falafel wrap", category: "Popular · Mains", sold: "31 sold today", available: "Available" },
              { name: "Crispy halloumi salad", category: "Mains", sold: "Sold out", available: "Unavailable" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3 px-5 py-4">
                <span className="grid size-9 place-items-center rounded-xl bg-ink text-lime">
                  <Icons.menuBoard size={15} />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-bold text-ink">{item.name}</span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {item.category} · {item.sold}
                  </span>
                </span>
                <Badge label={item.available} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Your service today" description="Keep customers up to date">
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between rounded-xl bg-surface p-3">
              <span>
                <span className="block text-[12px] font-bold text-ink">Accepting new orders</span>
                <span className="mt-1 block text-[11px] text-muted">Pause while you catch up</span>
              </span>
              <button
                onClick={() => setAccepting(!accepting)}
                className={`relative h-6 w-11 rounded-full transition ${accepting ? "bg-ink" : "bg-line-strong"}`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-full transition-all ${
                    accepting ? "left-6 bg-lime" : "left-1 bg-white"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Average prep time</span>
              <span className="font-bold text-ink">20 minutes</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Customer rating</span>
              <span className="font-bold text-ink">
                ★ 4.8 <span className="font-normal text-soft">(324)</span>
              </span>
            </div>
            <Link href="/hours" className="inline-block text-[12px] font-bold text-ink hover:underline">
              Hours & busy mode →
            </Link>
          </div>
        </Panel>
      </div>

      <Notice>Sample restaurant data · Orders, metrics and menu will sync with the backend.</Notice>
    </div>
  );
}
