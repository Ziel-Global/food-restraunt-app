import type { Metadata } from "next";
import { Manrope, Outfit } from "next/font/google";
import { RestaurantShell } from "@/components/RestaurantShell";
import { RestaurantWorkspaceProvider } from "@/components/restaurant-context";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crave Partner",
  description: "Restaurant partner workspace for the Crave food delivery platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <RestaurantWorkspaceProvider>
          <RestaurantShell>{children}</RestaurantShell>
        </RestaurantWorkspaceProvider>
      </body>
    </html>
  );
}
