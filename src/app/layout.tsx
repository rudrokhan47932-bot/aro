import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aro",
  description: "Premium subscription platform for tools and resources",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}