import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TryMonkMode",
  // The app is private: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
