"use client";
import { createContext, useContext, useMemo, useState } from "react";

export type OrderStatus = "New order" | "Preparing" | "Ready for pickup" | "Picked up" | "Delivered" | "Rejected";
export type RestaurantOrder = { id: string; customer: string; items: string; elapsed: string; status: OrderStatus; total: string; prep: string; note?: string; rejectionReason?: string };
export type MenuItem = { id: string; name: string; category: string; description: string; price: string; prep: string; available: boolean; popular?: boolean };
const initialOrders: RestaurantOrder[] = [
  { id: "FD-2048", customer: "Maya Chen", items: "Chicken shawarma · Fries · 2 items", elapsed: "2 min ago", status: "New order", total: "1,280", prep: "20 min", note: "No onions, please" },
  { id: "FD-2047", customer: "Noah Williams", items: "Beef burger · Lemonade · 3 items", elapsed: "8 min ago", status: "Preparing", total: "2,040", prep: "18 min" },
  { id: "FD-2046", customer: "Amira Khan", items: "Falafel wrap · 1 item", elapsed: "14 min ago", status: "Ready for pickup", total: "860", prep: "22 min" },
  { id: "FD-2045", customer: "Luca Moretti", items: "Olive plate · Chicken bowl · 4 items", elapsed: "21 min ago", status: "Picked up", total: "1,540", prep: "25 min" },
  { id: "FD-2044", customer: "Hana Kim", items: "Halloumi salad · 2 items", elapsed: "35 min ago", status: "Delivered", total: "1,050", prep: "15 min" },
];
const initialMenu: MenuItem[] = [
  { id: "M-01", name: "Chicken shawarma plate", category: "Popular", description: "Chargrilled chicken, saffron rice, garlic sauce", price: "1,280", prep: "18 min", available: true, popular: true },
  { id: "M-02", name: "Classic falafel wrap", category: "Popular", description: "Herb falafel, pickled turnip, tahini", price: "860", prep: "12 min", available: true, popular: true },
  { id: "M-03", name: "Beef kofta bowl", category: "Mains", description: "Grilled kofta, hummus, warm flatbread", price: "1,540", prep: "22 min", available: true },
  { id: "M-04", name: "Crispy halloumi salad", category: "Mains", description: "Seasonal greens, pomegranate, lemon dressing", price: "1,050", prep: "14 min", available: false },
  { id: "M-05", name: "Saffron fries", category: "Sides", description: "Skin-on fries with saffron salt", price: "420", prep: "8 min", available: true },
  { id: "M-06", name: "Mint lemonade", category: "Drinks", description: "Fresh mint, lemon, lightly sparkling", price: "360", prep: "4 min", available: true },
];
type ContextValue = { orders: RestaurantOrder[]; setOrderStatus: (id: string, status: OrderStatus, prep?: string) => void; rejectOrder: (id: string, reason: string) => void; menu: MenuItem[]; toggleMenuItem: (id: string) => void; addMenuItem: (item: Omit<MenuItem, "id">) => void; accepting: boolean; setAccepting: (value: boolean) => void; busyExtraMinutes: number; setBusyExtraMinutes: (value: number) => void };
const Context = createContext<ContextValue | null>(null);
export function RestaurantWorkspaceProvider({ children }: React.PropsWithChildren) {
  const [orders, setOrders] = useState(initialOrders);
  const [menu, setMenu] = useState(initialMenu);
  const [accepting, setAccepting] = useState(true);
  const [busyExtraMinutes, setBusyExtraMinutes] = useState(0);
  const value = useMemo(() => ({
    orders,
    setOrderStatus: (id: string, status: OrderStatus, prep?: string) => setOrders((current) => current.map((order) => order.id === id ? { ...order, status, prep: prep ?? order.prep } : order)),
    rejectOrder: (id: string, reason: string) => setOrders((current) => current.map((order) => order.id === id ? { ...order, status: "Rejected", rejectionReason: reason } : order)),
    menu,
    toggleMenuItem: (id: string) => setMenu((current) => current.map((item) => item.id === id ? { ...item, available: !item.available } : item)),
    addMenuItem: (item: Omit<MenuItem, "id">) => setMenu((current) => [{ ...item, id: `M-${Date.now()}` }, ...current]),
    accepting, setAccepting, busyExtraMinutes, setBusyExtraMinutes,
  }), [orders, menu, accepting, busyExtraMinutes]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useRestaurantWorkspace() { const value = useContext(Context); if (!value) throw new Error("Restaurant workspace context is missing"); return value; }
