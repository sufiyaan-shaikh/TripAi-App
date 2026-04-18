import "./globals.css"
import { SidebarProvider } from "@/context/SidebarContext"

export const metadata = {
  title: "TripAI — AI Travel Planning",
  description: "Plan and book your perfect trip with AI. Chat, plan, pay — done.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  )
}