"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Notice, PageTitle, Panel, Person, Search, SelectField, SelectPill, StatCard, Table, Cell } from "@/components/ui";
import { Icons } from "@/components/icons";
import { useRestaurantWorkspace, type OrderStatus } from "@/components/restaurant-context";

const tabs = ["All", "New order", "Preparing", "Ready for pickup", "Picked up"];

export default function OrdersPage() {
  const { orders, setOrderStatus, rejectOrder } = useRestaurantWorkspace();
  const [tab, setTab] = useState("New order");
  const [prepTime, setPrepTime] = useState("20 min");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("Too busy right now");
  const [message, setMessage] = useState("");

  const visible = useMemo(
    () =>
      orders.filter((order) => (tab === "All" ? order.status !== "Rejected" : order.status === tab)),
    [orders, tab],
  );

  function advance(orderId: string, status: OrderStatus, prep?: string) {
    setOrderStatus(orderId, status, prep);
    setMessage(`${orderId} moved to ${status.toLowerCase()}.`);
  }

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Orders"
        title="Order board"
        description="Accept new orders, keep customers updated, and hand completed meals to the rider."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setMessage("Alert sound test played.")}>
              Test alert sound
            </Button>
            <Button variant="secondary">Print queue</Button>
          </div>
        }
      />

      {message ? <Notice>{message}</Notice> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Needs response"
          value={String(orders.filter((o) => o.status === "New order").length)}
          tone="orange"
          icon={<Icons.bell size={14} />}
        />
        <StatCard
          label="Preparing"
          value={String(orders.filter((o) => o.status === "Preparing").length)}
          tone="blue"
          icon={<Icons.clock size={14} />}
        />
        <StatCard
          label="Ready to hand over"
          value={String(orders.filter((o) => o.status === "Ready for pickup").length)}
          tone="lime"
          icon={<Icons.check size={14} />}
        />
        <StatCard
          label="Completed today"
          value={String(orders.filter((o) => ["Picked up", "Delivered"].includes(o.status)).length)}
          tone="ink"
          icon={<Icons.orders size={14} />}
        />
      </div>

      <Panel
        title="Incoming orders"
        description="New orders need an accept or reject decision within 2 minutes"
        action={
          <div className="flex items-center gap-2 text-[11px] font-semibold text-muted">
            <span className="size-2 rounded-full bg-lime-deep animate-pulse-dot" />
            Auto-refresh ready
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <SelectPill options={tabs} selected={tab} onSelect={setTab} />
          <Search placeholder="Order number or customer…" />
        </div>

        {visible.length ? (
          <Table headers={["Order", "Customer", "Items & notes", "Status", "Prep time", "Total", "Actions"]}>
            {visible.map((order) => (
              <tr key={order.id}>
                <Cell>
                  <span className="font-bold text-ink">#{order.id}</span>
                  <span className="mt-1 block text-[11px] text-muted">{order.elapsed}</span>
                </Cell>
                <Cell>
                  <Person
                    initials={order.customer
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                    name={order.customer}
                    meta="Delivery order"
                  />
                </Cell>
                <Cell>
                  {order.items}
                  {order.note ? <span className="mt-1 block text-[11px] text-orange">Note: {order.note}</span> : null}
                </Cell>
                <Cell>
                  <Badge label={order.status} />
                </Cell>
                <Cell>{order.prep}</Cell>
                <Cell className="font-bold text-ink">
                  {order.total} <span className="text-[10px] font-normal text-muted">local</span>
                </Cell>
                <Cell>
                  <div className="flex gap-1">
                    {order.status === "New order" ? (
                      <>
                        <div className="w-[120px]">
                          <SelectField
                            value={prepTime}
                            options={["15 min", "20 min", "25 min", "30 min"]}
                            onChange={setPrepTime}
                          />
                        </div>
                        <Button onClick={() => advance(order.id, "Preparing", prepTime)}>Accept</Button>
                        <Button variant="danger" onClick={() => setRejecting(order.id)}>
                          Reject
                        </Button>
                      </>
                    ) : order.status === "Preparing" ? (
                      <Button onClick={() => advance(order.id, "Ready for pickup")}>Mark ready</Button>
                    ) : order.status === "Ready for pickup" ? (
                      <Button onClick={() => advance(order.id, "Picked up")}>Confirm handover</Button>
                    ) : (
                      <Button variant="secondary">Order details</Button>
                    )}
                  </div>
                </Cell>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-[14px] font-bold text-ink">No {tab.toLowerCase()} orders</p>
            <p className="mt-1 text-[12px] text-muted">New orders will show here as soon as they arrive.</p>
          </div>
        )}
      </Panel>

      {rejecting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              rejectOrder(rejecting, reason);
              setMessage(`${rejecting} rejected: ${reason}.`);
              setRejecting(null);
            }}
            className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange">Reject order #{rejecting}</p>
            <h2 className="font-display mt-2 text-lg font-bold text-ink">Why can’t you take this order?</h2>
            <div className="mt-5">
              <SelectField
                value={reason}
                options={["Too busy right now", "Item unavailable", "Restaurant is closing", "Other"]}
                onChange={setReason}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRejecting(null)}>
                Go back
              </Button>
              <Button variant="danger" type="submit">
                Reject order
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <p className="text-[11px] text-soft">
        Accepting an order starts the preparation stage. A rider collection confirms handover and updates the shared order
        timeline.
      </p>
    </div>
  );
}
