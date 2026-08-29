import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Kalam } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "TryMonkMode | The Operating System for Deep Work & Daily Habits",
  description: "Master deep work, atomic habits, task sprint matrix, and financial clarity with TryMonkMode.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "TryMonkMode — High-Velocity Productivity & Deep Work",
    description: "The all-in-one liquid glass operating system for deep focus sprints, atomic habit streaks, priority matrix, and financial clarity.",
    url: "https://trymonkmode.in",
    siteName: "TryMonkMode",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${kalam.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('trymonk_theme') || localStorage.getItem('aura_theme');
                if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
                // Prevent dragging of any images globally
                document.addEventListener('dragstart', function(e) {
                  if (e.target && ((e.target as any).tagName === 'IMG' || (e.target as any).tagName === 'PICTURE' || (e.target as any).tagName === 'SVG' || (e.target as any).closest('img'))) {
                    e.preventDefault();
                    return false;
                  }
                }, false);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}