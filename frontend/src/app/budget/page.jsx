"use client"
import React from "react"
import Sidebar from "@/components/layout/Sidebar"
import { useSidebar } from "@/context/SidebarContext"
import { Wallet, TrendingUp, CreditCard } from "lucide-react"

export default function BudgetPage() {
  const { isCollapsed } = useSidebar()

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", color: "var(--white)" }}>
      <Sidebar />
      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", padding: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Budget <span className="gold-text">Overview</span></h1>
        <p style={{ color: "var(--muted)", marginBottom: 40 }}>Detailed breakdown of your travel spending and upcoming estimates.</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div className="glass" style={{ padding: 32, borderRadius: 20, textAlign: "center", border: "1px dashed var(--border)" }}>
            <Wallet size={48} color="var(--gold)" style={{ marginBottom: 16, opacity: 0.5 }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Transaction History</h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>This feature is coming soon in your Pro subscription.</p>
          </div>
          <div className="glass" style={{ padding: 32, borderRadius: 20, textAlign: "center", border: "1px dashed var(--border)" }}>
            <TrendingUp size={48} color="var(--gold)" style={{ marginBottom: 16, opacity: 0.5 }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Spending Analytics</h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>We're syncing with your bank providers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
