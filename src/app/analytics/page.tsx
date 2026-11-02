import { Icons } from "@/components/icons";
import { Metric, PageTitle, Panel } from "@/components/ui";

const bars = [42, 56, 48, 72, 64, 88, 76];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Performance"
        title="Your performance"
        description="Understand orders, sales and menu performance over time."
        action={
          <select className="h-10 rounded-xl border border-line-strong bg-card px-3 text-[12px] font-semibold text-ink outline-none">
            <option>Last 7 days</option>
            <option>This month</option>
            <option>Last month</option>
          </select>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Gross sales" value="184,620" caption="In configured local currency" icon={<Icons.payouts size={16} />} />
        <Metric label="Orders completed" value="642" caption="Across 7 days" icon={<Icons.orders size={16} />} />
        <Metric label="Average order" value="1,284" caption="Local currency per order" icon={<Icons.trendUp size={16} />} />
        <Metric label="Restaurant rating" value="4.8 / 5" caption="324 customer reviews" icon={<Icons.promotions size={16} />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Orders & sales" description="Completed orders by day">
          <div className="px-5 py-6">
            <div className="flex h-52 items-end gap-3 border-b border-l border-line px-3">
              {bars.map((height, i) => (
                <div key={i} className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className={`rounded-t-md ${i === 5 ? "bg-ink" : "bg-lime"}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="-mb-5 mt-2 text-center text-[10px] text-muted">
                    {["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between text-[10px] text-muted">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150 orders</span>
            </div>
          </div>
        </Panel>

        <Panel title="Top selling items" description="This week">
          <div className="divide-y divide-line">
            {[
              { item: "Chicken shawarma plate", orders: "148" },
              { item: "Classic falafel wrap", orders: "102" },
              { item: "Beef kofta bowl", orders: "84" },
              { item: "Mint lemonade", orders: "61" },
            ].map((row, i) => (
              <div key={row.item} className="flex items-center gap-3 px-5 py-4">
                <span className="w-5 text-[11px] font-bold text-muted">0{i + 1}</span>
                <span className="grid size-9 place-items-center rounded-xl bg-ink text-lime">
                  <Icons.menuBoard size={14} />
                </span>
                <span className="flex-1 text-[13px] font-bold text-ink">{row.item}</span>
                <span className="text-[12px] font-bold text-ink">
                  {row.orders} <span className="font-normal text-muted">orders</span>
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Customer feedback" description="Recent review themes">
          <div className="space-y-4 p-5">
            {[
              ["Food quality", "★ 4.9"],
              ["Packaging", "★ 4.7"],
              ["Order accuracy", "★ 4.8"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[12px] text-muted">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </div>
            ))}
            <p className="rounded-xl bg-surface p-3 text-[12px] leading-5 text-muted">
              “Fresh, warm, and exactly as described. The garlic sauce was excellent.”
              <span className="block pt-1 text-soft">Recent customer review</span>
            </p>
          </div>
        </Panel>

        <Panel title="Fulfillment" description="How orders move through your kitchen">
          <div className="space-y-4 p-5">
            {[
              { label: "Accepted within 2 minutes", pct: 94 },
              { label: "Ready within estimate", pct: 88 },
              { label: "Order accuracy", pct: 97 },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted">{row.label}</span>
                  <b className="text-ink">{row.pct}%</b>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-line">
                  <div className="h-full rounded-full bg-lime-deep" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <p className="text-center text-[11px] text-soft">
        Preview analytics · Live reports will be calculated from completed platform orders.
      </p>
    </div>
  );
}
