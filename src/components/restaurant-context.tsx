"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type OrderStatus =
  | "New order"
  | "Preparing"
  | "Ready for pickup"
  | "Picked up"
  | "Delivered"
  | "Rejected";

export type RestaurantOrder = {
  id: string;
  customer: string;
  items: string;
  elapsed: string;
  status: OrderStatus;
  total: string;
  prep: string;
  note?: string;
  rejectionReason?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  prep: string;
  available: boolean;
  popular?: boolean;
  image?: string;
};

export type ModifierOption = {
  id: string;
  name: string;
  price: string;
};

export type ModifierGroup = {
  id: string;
  name: string;
  required: boolean;
  maxChoices: number;
  options: ModifierOption[];
};

const MENU_STORAGE_KEY = "crave.restaurant.menu.v1";
const MODIFIER_STORAGE_KEY = "crave.restaurant.modifiers.v1";

const initialOrders: RestaurantOrder[] = [
  {
    id: "FD-2048",
    customer: "Maya Chen",
    items: "Chicken shawarma · Fries · 2 items",
    elapsed: "2 min ago",
    status: "New order",
    total: "1,280",
    prep: "20 min",
    note: "No onions, please",
  },
  {
    id: "FD-2047",
    customer: "Noah Williams",
    items: "Beef burger · Lemonade · 3 items",
    elapsed: "8 min ago",
    status: "Preparing",
    total: "2,040",
    prep: "18 min",
  },
  {
    id: "FD-2046",
    customer: "Amira Khan",
    items: "Falafel wrap · 1 item",
    elapsed: "14 min ago",
    status: "Ready for pickup",
    total: "860",
    prep: "22 min",
  },
  {
    id: "FD-2045",
    customer: "Luca Moretti",
    items: "Olive plate · Chicken bowl · 4 items",
    elapsed: "21 min ago",
    status: "Picked up",
    total: "1,540",
    prep: "25 min",
  },
  {
    id: "FD-2044",
    customer: "Hana Kim",
    items: "Halloumi salad · 2 items",
    elapsed: "35 min ago",
    status: "Delivered",
    total: "1,050",
    prep: "15 min",
  },
];

const initialMenu: MenuItem[] = [
  {
    id: "M-01",
    name: "Chicken shawarma plate",
    category: "Popular",
    description: "Chargrilled chicken, saffron rice, garlic sauce",
    price: "1,280",
    prep: "18 min",
    available: true,
    popular: true,
  },
  {
    id: "M-02",
    name: "Classic falafel wrap",
    category: "Popular",
    description: "Herb falafel, pickled turnip, tahini",
    price: "860",
    prep: "12 min",
    available: true,
    popular: true,
  },
  {
    id: "M-03",
    name: "Beef kofta bowl",
    category: "Mains",
    description: "Grilled kofta, hummus, warm flatbread",
    price: "1,540",
    prep: "22 min",
    available: true,
  },
  {
    id: "M-04",
    name: "Crispy halloumi salad",
    category: "Mains",
    description: "Seasonal greens, pomegranate, lemon dressing",
    price: "1,050",
    prep: "14 min",
    available: false,
  },
  {
    id: "M-05",
    name: "Saffron fries",
    category: "Sides",
    description: "Skin-on fries with saffron salt",
    price: "420",
    prep: "8 min",
    available: true,
  },
  {
    id: "M-06",
    name: "Mint lemonade",
    category: "Drinks",
    description: "Fresh mint, lemon, lightly sparkling",
    price: "360",
    prep: "4 min",
    available: true,
  },
];

const initialModifiers: ModifierGroup[] = [
  {
    id: "MG-01",
    name: "Choose your size",
    required: true,
    maxChoices: 1,
    options: [
      { id: "MO-01", name: "Regular", price: "0" },
      { id: "MO-02", name: "Large", price: "180" },
      { id: "MO-03", name: "Family", price: "420" },
    ],
  },
  {
    id: "MG-02",
    name: "Add extras",
    required: false,
    maxChoices: 4,
    options: [
      { id: "MO-04", name: "Extra chicken", price: "320" },
      { id: "MO-05", name: "Halloumi", price: "280" },
      { id: "MO-06", name: "Avocado", price: "220" },
    ],
  },
  {
    id: "MG-03",
    name: "Sauces",
    required: false,
    maxChoices: 2,
    options: [
      { id: "MO-07", name: "Garlic sauce", price: "0" },
      { id: "MO-08", name: "Chili sauce", price: "0" },
      { id: "MO-09", name: "Tahini", price: "40" },
      { id: "MO-10", name: "Extra hummus", price: "80" },
    ],
  },
];

type ContextValue = {
  orders: RestaurantOrder[];
  setOrderStatus: (id: string, status: OrderStatus, prep?: string) => void;
  rejectOrder: (id: string, reason: string) => void;
  menu: MenuItem[];
  toggleMenuItem: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  modifiers: ModifierGroup[];
  addModifierGroup: (group: Omit<ModifierGroup, "id">) => void;
  updateModifierGroup: (id: string, group: Omit<ModifierGroup, "id">) => void;
  deleteModifierGroup: (id: string) => void;
  accepting: boolean;
  setAccepting: (value: boolean) => void;
  busyExtraMinutes: number;
  setBusyExtraMinutes: (value: number) => void;
};

const Context = createContext<ContextValue | null>(null);

function loadStoredMenu(): MenuItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuItem[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function loadStoredModifiers(): ModifierGroup[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MODIFIER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModifierGroup[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function RestaurantWorkspaceProvider({ children }: React.PropsWithChildren) {
  const [orders, setOrders] = useState(initialOrders);
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [modifiers, setModifiers] = useState<ModifierGroup[]>(initialModifiers);
  const [hydrated, setHydrated] = useState(false);
  const [accepting, setAccepting] = useState(true);
  const [busyExtraMinutes, setBusyExtraMinutes] = useState(0);

  useEffect(() => {
    const storedMenu = loadStoredMenu();
    const storedModifiers = loadStoredModifiers();
    if (storedMenu?.length) setMenu(storedMenu);
    if (storedModifiers?.length) setModifiers(storedModifiers);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
      window.localStorage.setItem(MODIFIER_STORAGE_KEY, JSON.stringify(modifiers));
    } catch {
      /* localStorage can fill up with large images — keep UI working */
    }
  }, [menu, modifiers, hydrated]);

  const value = useMemo(
    () => ({
      orders,
      setOrderStatus: (id: string, status: OrderStatus, prep?: string) =>
        setOrders((current) =>
          current.map((order) => (order.id === id ? { ...order, status, prep: prep ?? order.prep } : order)),
        ),
      rejectOrder: (id: string, reason: string) =>
        setOrders((current) =>
          current.map((order) => (order.id === id ? { ...order, status: "Rejected" as const, rejectionReason: reason } : order)),
        ),
      menu,
      toggleMenuItem: (id: string) =>
        setMenu((current) => current.map((item) => (item.id === id ? { ...item, available: !item.available } : item))),
      addMenuItem: (item: Omit<MenuItem, "id">) =>
        setMenu((current) => [{ ...item, id: `M-${Date.now()}` }, ...current]),
      modifiers,
      addModifierGroup: (group: Omit<ModifierGroup, "id">) =>
        setModifiers((current) => [{ ...group, id: `MG-${Date.now()}` }, ...current]),
      updateModifierGroup: (id: string, group: Omit<ModifierGroup, "id">) =>
        setModifiers((current) => current.map((item) => (item.id === id ? { ...group, id } : item))),
      deleteModifierGroup: (id: string) => setModifiers((current) => current.filter((item) => item.id !== id)),
      accepting,
      setAccepting,
      busyExtraMinutes,
      setBusyExtraMinutes,
    }),
    [orders, menu, modifiers, accepting, busyExtraMinutes],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRestaurantWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("Restaurant workspace context is missing");
  return value;
}
