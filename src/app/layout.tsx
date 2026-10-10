import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export const metadata: Metadata = {
  title: {
    default: "RouteyAI: School Bus Route Planning",
    template: "%s · RouteyAI",
  },
  description:
    "School bus route planning, live bus tracking and parent notifications for schools in Qatar.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#070D1E" },
  ],
  width: "device-width",
  initialScale: 1,
}

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${inter.variable}`}>
      <body className="min-h-screen antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          >
            Skip to main content
          </a>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "rounded-xl border shadow-sm dark:border-slate-800 dark:bg-slate-900",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
