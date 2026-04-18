"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { logoutUser } from "@/lib/auth"
import { getTripStats, getTripHistory } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { useSidebar } from "@/context/SidebarContext"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [dashboardStats, setDashboardStats] = useState({
    trips_planned: 0,
    trips_booked: 0,
    total_spent: 0
  })
  const [recentTrips, setRecentTrips] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    if (!loading && user) {
      Promise.all([getTripStats(), getTripHistory()])
        .then(([statsData, historyData]) => {
          setDashboardStats(statsData)
          setRecentTrips(historyData.trips?.slice(0, 4) || [])
        })
        .catch(console.error)
        .finally(() => setDataLoading(false))
    }
  }, [loading, user])

  const handleLogout = async () => {
    await logoutUser()
    router.push("/auth/login")
  }

  if (loading || dataLoading) return <LoadingScreen message="Loading your travel hub..." />

  const stats = [
    { label: "Trips Planned", value: dashboardStats.trips_planned.toString() },
    { label: "Trips Booked", value: dashboardStats.trips_booked.toString() },
    { label: "Total Spent", value: `₹${dashboardStats.total_spent.toLocaleString()}` },
  ]

  const quickActions = [
    { icon: "✈", label: "Plan a Trip", sub: "Chat with AI to plan your next adventure", action: () => router.push("/chat"), gold: true },
    { icon: "⚙", label: "Preferences", sub: "Set your flight class, hotel stars & budget", action: () => router.push("/profile"), gold: false },
  ]

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-ambient-glow">
        <div className="extra-glow" />
      </div>
      <Sidebar />
      
      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", paddingBottom: 60 }}>

      {/* HERO */}
      <div style={{
        padding: "80px 40px 60px",
        maxWidth: 900, margin: "0 auto",
        animation: "fadeUp 0.5s ease",
      }}>
        <p className="section-label" style={{ marginBottom: 12 }}>Dashboard</p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 700,
          letterSpacing: "-0.03em", lineHeight: 1.05,
          color: "var(--white)", marginBottom: 20,
          position: "relative",
          zIndex: 1
        }}>
          Where to next,<br />
          <span style={{ 
            background: "linear-gradient(to right, var(--gold), var(--gold-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(245,158,11,0.2))"
          }}>
            {user?.full_name?.split(" ")[0] || "Traveller"}?
          </span>

          {/* Decorative halo behind name */}
          <div style={{
            position: "absolute", top: "50%", left: "20%",
            width: 300, height: 150, borderRadius: "50%",
            background: "var(--gold)", filter: "blur(80px)",
            opacity: 0.05, zIndex: -1, pointerEvents: "none"
          }} />
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.6, maxWidth: 480 }}>
          Tell our AI where you want to go — it will plan flights, hotels,
          and your full itinerary in seconds.
        </p>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "0 40px 40px", maxWidth: 900, margin: "0 auto" }}>
        
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {stats.map((s, i) => (
            <div key={i} className="glass card-hover" style={{
              borderRadius: 16, padding: "24px 28px",
              animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
            }}>
              <p style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--white)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 64 }}>
          {quickActions.map((a, i) => (
            <button
              key={i} onClick={a.action}
              style={{
                background: a.gold ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))" : "rgba(255,255,255,0.02)",
                border: `1px solid ${a.gold ? "var(--border-gold)" : "var(--border)"}`,
                borderRadius: 20, padding: "32px 28px",
                textAlign: "left", cursor: "pointer",
                transition: "all 0.25s ease",
                animation: `fadeUp 0.4s ease ${0.3 + i * 0.1}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.borderColor = a.gold ? "var(--gold)" : "rgba(255,255,255,0.15)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.borderColor = a.gold ? "var(--border-gold)" : "var(--border)"
              }}
            >
              <div style={{
                fontSize: 28, marginBottom: 16,
                width: 52, height: 52, borderRadius: 14,
                background: a.gold ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {a.icon}
              </div>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600,
                color: "var(--white)", marginBottom: 6,
              }}>
                {a.label}
              </p>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>{a.sub}</p>
              <p style={{ fontSize: 13, color: a.gold ? "var(--gold)" : "var(--muted)", marginTop: 16, fontWeight: 500 }}>
                {a.gold ? "Start planning →" : "Update settings →"}
              </p>
            </button>
          ))}
        </div>

        {/* RECENT TRIPS */}
        <div style={{ animation: "fadeUp 0.5s ease 0.5s both" }}>
          <p className="section-label" style={{ marginBottom: 16 }}>Recent Trips</p>
          {recentTrips.length === 0 ? (
            <div className="glass" style={{
              borderRadius: 16, padding: "48px", textAlign: "center",
              border: "1px dashed var(--border)",
            }}>
              <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 16 }}>You haven't planned any trips yet.</p>
              <button className="btn-gold" onClick={() => router.push("/chat")} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 14 }}>
                Plan your first trip
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {recentTrips.map((trip, i) => (
                <div key={i} className="glass card-hover" style={{
                  borderRadius: 16, padding: "20px",
                  borderLeft: trip.status === "booked" ? "4px solid var(--gold)" : "4px solid transparent",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--white)", marginBottom: 4 }}>
                        {trip.destination}
                      </h3>
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      background: trip.status === "booked" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                      color: trip.status === "booked" ? "var(--gold)" : "var(--muted)",
                      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em"
                    }}>
                      {trip.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: "var(--muted)" }}>{trip.duration_days} Days</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--white)" }}>₹{trip.total_cost?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}