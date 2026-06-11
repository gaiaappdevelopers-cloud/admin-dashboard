import { Geist_Mono, DM_Sans, Nunito_Sans, Cormorant_Garamond } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const nunitoSansHeading = Nunito_Sans({ subsets: ["latin"], variable: "--font-heading" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-wordmark",
  weight: ["400", "500", "600"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        dmSans.variable,
        nunitoSansHeading.variable,
        fontMono.variable,
        cormorantGaramond.variable,
        "font-sans"
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
