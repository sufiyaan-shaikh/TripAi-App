"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getTripHistory } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { useSidebar } from "@/context/SidebarContext"

const STATUS_COLORS = {
  booked:  { bg: "rgba(245,158,11,0.12)", color: "var(--gold)",   border: "rgba(245,158,11,0.3)" },
  planned: { bg: "rgba(59,130,246,0.10)", color: "#60a5fa",       border: "rgba(59,130,246,0.25)" },
  default: { bg: "rgba(255,255,255,0.04)", color: "var(--muted)", border: "var(--border)" },
}

function TripsPageInner() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [trips, setTrips]         = useState([])
  const [filtered, setFiltered]   = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [filter, setFilter]       = useState("all")
  const [search, setSearch]       = useState("")
  const { isCollapsed }           = useSidebar()

  // Initialize filter from URL if present
  useEffect(() => {
    const urlFilter = searchParams.get("filter")
    if (urlFilter && ["planned", "booked", "all"].includes(urlFilter)) {
      setFilter(urlFilter)
    }
  }, [searchParams])

  useEffect(() => {
    if (!loading && user) {
      getTripHistory()
        .then(data => {
          const all = data.trips || []
          setTrips(all)
          setFiltered(all)
        })
        .catch(console.error)
        .finally(() => setDataLoading(false))
    }
  }, [loading, user])

  useEffect(() => {
    let result = trips
    if (filter !== "all") result = result.filter(t => (t.status || "planned") === filter)
    if (search.trim()) result = result.filter(t =>
      t.destination?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [filter, search, trips])

  if (loading || dataLoading) return <LoadingScreen message="Loading your travel history..." />

  const statusStyle = (status) => STATUS_COLORS[status] || STATUS_COLORS.default

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-ambient-glow"><div className="extra-glow" /></div>
      <Sidebar />

      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", padding: "80px 40px 60px", maxWidth: 1100, margin: "0 auto 0 auto", paddingLeft: isCollapsed ? 120 : 300 }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40, animation: "fadeUp 0.5s ease" }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Travel History</p>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700,
            color: "var(--white)", letterSpacing: "-0.03em", marginBottom: 12,
          }}>
            My <span style={{ background: "linear-gradient(to right, var(--gold), var(--gold-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Trips</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16 }}>
            {trips.length} trip{trips.length !== 1 ? "s" : ""} planned so far. Every journey starts with a plan.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", animation: "fadeUp 0.5s ease 0.1s both" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="input-dark"
            style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 12, fontSize: 14 }}
          />
          {["all", "planned", "booked"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "10px 20px", borderRadius: 12, border: "1px solid",
                borderColor: filter === f ? "var(--gold)" : "var(--border)",
                background: filter === f ? "rgba(245,158,11,0.1)" : "transparent",
                color: filter === f ? "var(--gold)" : "var(--muted)",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                textTransform: "capitalize", transition: "all 0.2s",
              }}
            >
              {f === "all" ? "All Trips" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Trips Grid */}
        {filtered.length === 0 ? (
          <div className="glass" style={{ borderRadius: 20, padding: 60, textAlign: "center", border: "1px dashed var(--border)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 20 }}>
              {search || filter !== "all" ? "No trips match your filter." : "You haven't planned any trips yet."}
            </p>
            <button className="btn-gold" onClick={() => router.push("/chat")} style={{ padding: "12px 24px", borderRadius: 12 }}>
              Plan your first trip →
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filtered.map((trip, i) => {
              const s = statusStyle(trip.status)
              return (
                <div
                  key={trip.id || i}
                  className="glass card-hover"
                  style={{
                    borderRadius: 20, padding: 24,
                    borderLeft: `3px solid ${s.border}`,
                    animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
                    display: "flex", flexDirection: "column", gap: 16,
                  }}
                >
                  {/* Top Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--white)", marginBottom: 4 }}>
                        {trip.destination}
                      </h3>
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date TBD"}
                        {trip.end_date ? ` – ${new Date(trip.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                      </p>
                    </div>
                    <span style={{
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {trip.status || "planned"}
                    </span>
                  </div>

                  {/* Meta */}
                  <div style={{ display: "flex", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Duration</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--white)" }}>{trip.duration_days || "?"} Days</p>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Est. Cost</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--white)" }}>₹{(trip.total_cost || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => router.push("/chat")}
                      className="btn-gold"
                      style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 13 }}
                    >
                      Continue Planning →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TripsPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Synchronizing travel history..." />}>
      <TripsPageInner />
    </Suspense>
  )
}
