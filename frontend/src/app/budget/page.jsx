"use client"
import React, { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import { useSidebar } from "@/context/SidebarContext"
import { Wallet, TrendingUp, CreditCard, ArrowDownLeft, ArrowUpRight, DollarSign } from "lucide-react"
import { getPaymentHistory, getTripStats } from "@/lib/api"
import LoadingScreen from "@/components/ui/LoadingScreen"

export default function BudgetPage() {
  const { isCollapsed } = useSidebar()
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({ total_spent: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [budgetGoal, setBudgetGoal] = useState(100000)

  useEffect(() => {
    const savedGoal = localStorage.getItem("tripai_budget_goal")
    if (savedGoal) setBudgetGoal(parseInt(savedGoal, 10))

    const fetchData = async () => {
      try {
        const [h, s] = await Promise.all([getPaymentHistory(), getTripStats()])
        setHistory(h.payments || [])

        const spent = h.payments?.reduce((acc, curr) => acc + (curr.status === "succeeded" ? curr.amount_inr : 0), 0) || 0
        setStats({ total_spent: spent, pending: 0 })
      } catch (err) {
        console.error("Budget fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingScreen message="Calculating your travel finances..." />

  const utilizationPref = (stats.total_spent / budgetGoal) * 100

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", color: "var(--white)" }}>
      <Sidebar />
      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", padding: "40px 60px", maxWidth: 1400, margin: "0 auto", paddingLeft: isCollapsed ? 140 : 320 }}>

        <header style={{ marginBottom: 40 }}>
          <p className="section-label" style={{ marginBottom: 12 }}>Financial Hub</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, margin: 0 }}>
            Budget <span className="gold-text">Insight</span>
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 10, fontSize: 16 }}>Detailed tracking of your travel investments and budget goals.</p>
        </header>

        {}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
          <div className="glass" style={{ padding: 28, borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Spent</span>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>₹{stats.total_spent.toLocaleString()}</p>
            <div style={{ marginTop: 12, fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
               Confirmed transactions
            </div>
          </div>

          <div className="glass" style={{ padding: 28, borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Budget Goal</span>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
                <Wallet size={20} />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>₹{budgetGoal.toLocaleString()}</p>
            <p style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>Set from your dashboard</p>
          </div>

          <div className="glass" style={{ padding: 28, borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Utilization</span>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                <CreditCard size={20} />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{utilizationPref.toFixed(1)}%</p>
            <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, marginTop: 18, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(utilizationPref, 100)}%`, height: "100%", background: utilizationPref > 100 ? "#ef4444" : "var(--gold)", transition: "width 1s ease" }} />
            </div>
          </div>
        </div>

        {}
        <div className="glass" style={{ borderRadius: 24, padding: "32px 0", overflow: "hidden" }}>
          <div style={{ padding: "0 32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Recent Transactions</h2>
            <button style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Filter: All</button>
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <th style={{ padding: "16px 32px", fontWeight: 600 }}>Destination</th>
                  <th style={{ padding: "16px 32px", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "16px 32px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "16px 32px", fontWeight: 600, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((pay, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 14, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.01)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "18px 32px", fontWeight: 600 }}>{pay.trip?.destination || "General Payment"}</td>
                    <td style={{ padding: "18px 32px", color: "var(--muted)" }}>{new Date(pay.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "18px 32px" }}>
                      <span style={{ 
                        padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: pay.status === "succeeded" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        color: pay.status === "succeeded" ? "#10b981" : "#f59e0b"
                      }}>
                        {pay.status}
                      </span>
                    </td>
                    <td style={{ padding: "18px 32px", textAlign: "right", fontWeight: 700, color: "var(--white)" }}>
                      ₹{pay.amount_inr.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: "60px 32px", textAlign: "center", color: "var(--muted)" }}>
                      No transactions found yet. Plan a trip to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
