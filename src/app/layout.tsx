import type { Metadata } from "next";
import { RestaurantShell } from "@/components/RestaurantShell";
import { RestaurantWorkspaceProvider } from "@/components/restaurant-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restaurant Portal",
  description: "Order and menu workspace for restaurant partners.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><RestaurantWorkspaceProvider><RestaurantShell>{children}</RestaurantShell></RestaurantWorkspaceProvider></body>
    </html>
  );
}
