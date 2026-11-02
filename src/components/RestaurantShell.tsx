"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRestaurantWorkspace } from "@/components/restaurant-context";

const navigation = [
  { label: "Overview", href: "/", icon: "◫", group: "Workspace" },
  { label: "Orders", href: "/orders", icon: "▤", count: "3" },
  { label: "Menu", href: "/menu", icon: "☷" },
  { label: "Hours & availability", href: "/hours", icon: "◷" },
  { label: "Team", href: "/team", icon: "♙", group: "Your business" },
  { label: "Analytics", href: "/analytics", icon: "▥" },
  { label: "Payouts", href: "/payouts", icon: "↔" },
  { label: "Restaurant profile", href: "/settings", icon: "⚙", group: "Settings" },
];

export function RestaurantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { accepting, setAccepting, orders } = useRestaurantWorkspace();
  const pendingOrders = orders.filter((order) => order.status === "New order").length;
  if (pathname === "/login" || pathname === "/onboarding") return <>{children}</>;
  return <div className="min-h-screen bg-[#f5f7f4] text-[#17221d]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-white/10 bg-[#13251d] px-4 py-5 text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2"><span className="grid size-10 place-items-center rounded-[14px] bg-[#c2e78a] text-xl font-black text-[#183729]">f</span><span><span className="block text-[17px] font-extrabold tracking-tight">field<span className="text-[#c2e78a]">/</span>kitchen</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.2em] text-[#9aada3]">Partner portal</span></span></Link>
      <button className="mx-2 mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-3 text-left"><span className="grid size-9 place-items-center rounded-xl bg-[#284333] text-sm">⌂</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">Olive & Thyme</span><span className="mt-1 block text-[10px] text-[#9aada3]">Central City</span></span><span className="text-xs text-[#9aada3]">⌄</span></button>
      <nav className="mt-6 flex-1 space-y-1" aria-label="Restaurant navigation">{navigation.map((item) => <div key={item.href}>{item.group ? <p className="px-3 pb-2 pt-5 text-[9px] font-bold uppercase tracking-[.19em] text-[#81968a]">{item.group}</p> : null}<Link onClick={() => setOpen(false)} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition ${pathname === item.href ? "bg-[#c2e78a] text-[#193a2a]" : "text-[#c5d2ca] hover:bg-white/[.07] hover:text-white"}`}><span className="grid size-6 place-items-center text-[16px]">{item.icon}</span>{item.label}{item.label === "Orders" && pendingOrders ? <span className="ml-auto rounded-full bg-[#dba55c] px-2 py-0.5 text-[9px] font-extrabold text-[#3d2a11]">{pendingOrders}</span> : null}</Link></div>)}</nav>
      <div className="mx-1 rounded-2xl border border-white/10 bg-[#1b3026] p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold">Today’s service</span><span className={`size-2 rounded-full ${accepting ? "bg-[#c2e78a]" : "bg-[#de855f]"}`} /></div><p className="mt-2 text-[10px] leading-4 text-[#a9b9af]">{accepting ? "Accepting new orders" : "Orders are paused"}</p><button onClick={() => setAccepting(!accepting)} className="mt-3 text-[10px] font-bold text-[#c2e78a]">{accepting ? "Pause orders" : "Resume orders"} →</button></div>
      <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-2 pt-4"><div className="grid size-9 place-items-center rounded-full bg-[#dce9dd] text-xs font-bold text-[#193a2a]">MP</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Mina Patel</p><p className="mt-0.5 text-[10px] text-[#9aada3]">Restaurant owner</p></div><Link href="/login" aria-label="Sign out" className="text-[#9aada3] hover:text-white">↪</Link></div>
    </aside>
    {open ? <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" /> : null}
    <div className="min-h-screen lg:pl-[256px]"><header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#e8ece7] bg-white/95 px-5 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-xl border border-[#e6ebe5] text-lg lg:hidden">☰</button><div><p className="text-[10px] font-semibold text-[#87918a]">OLIVE & THYME · CENTRAL CITY</p><p className="mt-0.5 text-[13px] font-bold">{navigation.find((item) => item.href === pathname)?.label ?? "Restaurant workspace"}</p></div></div><div className="flex items-center gap-2"><button onClick={() => setAccepting(!accepting)} className={`flex h-9 items-center gap-2 rounded-xl px-3 text-[10px] font-bold ${accepting ? "bg-[#edf5ea] text-[#47784f]" : "bg-[#fff1e9] text-[#a86243]"}`}><span className={`size-1.5 rounded-full ${accepting ? "bg-[#4a9d61]" : "bg-[#d58a56]"}`} />{accepting ? "Accepting orders" : "Orders paused"}</button><button aria-label="Notifications" className="grid size-9 place-items-center rounded-xl border border-[#e7ebe6]">♧</button><span className="hidden size-8 place-items-center rounded-full bg-[#e4eee1] text-[10px] font-bold text-[#4d6d50] sm:grid">MP</span></div></header><main className="mx-auto max-w-[1420px] px-5 py-7 sm:px-8 lg:px-10">{children}</main></div>
  </div>;
}

export function ApiStatus() {
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => { const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"; fetch(`${base.replace(/\/$/, "")}/health`).then((response) => setOnline(response.ok)).catch(() => setOnline(false)); }, []);
  return <span className={`inline-flex items-center gap-1.5 text-[9px] font-semibold ${online ? "text-[#4c8154]" : online === null ? "text-[#9aa29b]" : "text-[#ad744d]"}`}><i className={`size-1.5 rounded-full ${online ? "bg-[#55a46a]" : online === null ? "bg-[#b6beb7]" : "bg-[#d99559]"}`} />{online ? "API online · sample orders" : online === null ? "Connecting to API" : "Preview mode · API not reachable"}</span>;
}
