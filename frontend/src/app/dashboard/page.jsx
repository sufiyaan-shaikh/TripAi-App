"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getTripStats, getTripHistory } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { useSidebar } from "@/context/SidebarContext"
import BudgetChart from "@/components/dashboard/BudgetChart"
import { Search, Bell, Plus, MapPin, Map, LayoutDashboard, Calendar, ArrowRight } from "lucide-react"

const STAT_CARDS = (stats) => [
  { label: "Trips Planned",    value: stats.trips_planned,    icon: <LayoutDashboard size={22} />, color: "#3b82f6", href: "/trips?filter=all" },
  { label: "Countries Visited",value: stats.countries_visited, icon: <Map size={22} />,             color: "#10b981", href: "/trips?filter=booked" },
  { label: "Places Saved",     value: stats.places_saved,     icon: <MapPin size={22} />,           color: "#f59e0b", href: "/wishlist" },
  { label: "Upcoming Trips",   value: stats.upcoming_trips,   icon: <Calendar size={22} />,         color: "#ef4444", href: "/trips?filter=planned" },
]

const RECOMMENDED = [
  { city: "Bali",      country: "Indonesia",    days: 7, price: 85000,  img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80" },
  { city: "Swiss Alps",country: "Switzerland",  days: 6, price: 120000, img: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=400&q=80" },
  { city: "Tokyo",     country: "Japan",        days: 5, price: 95000,  img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80" },
  { city: "London",    country: "UK",           days: 4, price: 75000,  img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80" },
  { city: "New York",  country: "USA",          days: 5, price: 155000, img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80" },
  { city: "Rome",      country: "Italy",        days: 6, price: 90000,  img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80" },
]

const ACTIVITY = [
  { text: "Added Bali to wishlist",                date: "2 May 2025" },
  { text: "Created new itinerary for Switzerland", date: "30 Apr 2025" },
  { text: "Budget updated for Japan trip",         date: "28 Apr 2025" },
]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { isCollapsed } = useSidebar()
  const [stats, setStats] = useState({ trips_planned: 0, countries_visited: 0, places_saved: 0, upcoming_trips: 0 })
  const [recentTrips, setRecentTrips] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (!loading && user) {
      Promise.all([getTripStats(), getTripHistory()])
        .then(([s, h]) => { setStats(s); setRecentTrips(h.trips?.slice(0, 3) || []) })
        .catch(console.error)
        .finally(() => setDataLoading(false))
    }
  }, [loading, user])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/chat?destination=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  if (loading || dataLoading) return <LoadingScreen message="Unlocking your travel portal..." />

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", color: "var(--white)" }}>
      <Sidebar />

      {}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))",
          border: "1px solid var(--border-gold)", borderRadius: 12,
          padding: "12px 20px", fontSize: 14, color: "var(--white)",
          backdropFilter: "blur(16px)", animation: "fadeUp 0.3s ease"
        }}>
          {toast}
        </div>
      )}

      {}
      {searchOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setSearchOpen(false)}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={handleSearch}
            style={{ width: "100%", maxWidth: 560, padding: "0 24px" }}
          >
            <div style={{ position: "relative" }}>
              <Search size={18} color="var(--muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="input-dark"
                style={{ padding: "16px 16px 16px 48px", borderRadius: 16, fontSize: 16, border: "1px solid var(--border-gold)" }}
              />
            </div>
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, marginTop: 12 }}>Press Enter to plan with AI · Esc to close</p>
          </form>
        </div>
      )}

      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {}
        <header style={{
          padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid var(--border)", background: "rgba(2,6,23,0.8)",
          backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Hello, {user?.full_name?.split(" ")[0] || "Traveller"}! 👋</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Where would you like to explore today?</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              title="Search destinations"
            >
              <Search size={17} color="var(--muted)" />
            </button>
            <button
              onClick={() => showToast("🔔 Notifications coming soon!")}
              style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              title="Notifications"
            >
              <Bell size={17} color="var(--muted)" />
            </button>
            <Link href="/chat" style={{ textDecoration: "none" }}>
              <button className="btn-gold" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 12, fontSize: 14 }}>
                <Plus size={17} />
                <span>New Trip</span>
              </button>
            </Link>
          </div>
        </header>

        <main style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 28 }}>

          {}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {STAT_CARDS(stats).map((card, i) => (
              <Link key={i} href={card.href} style={{ textDecoration: "none" }}>
                <div
                  className="glass card-hover"
                  style={{ borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14, animation: `fadeUp 0.4s ease ${i * 0.08}s both`, cursor: "pointer" }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{card.label}</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--white)", margin: 0 }}>{card.value}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 28 }}>

            {}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, margin: 0 }}>Recommended for You</h3>
                <Link href="/wishlist" style={{ textDecoration: "none" }}>
                  <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View All</span>
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {RECOMMENDED.map((trip, i) => (
                  <Link key={i} href={`/chat?destination=${encodeURIComponent(trip.city)}`} style={{ textDecoration: "none" }}>
                    <div
                      className="card-hover"
                      style={{
                        borderRadius: 14, overflow: "hidden", cursor: "pointer",
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.03)",
                        animation: `fadeUp 0.4s ease ${0.3 + i * 0.1}s both`
                      }}
                    >
                      <div style={{ height: 130, overflow: "hidden", position: "relative" }}>
                        <img
                          src={trip.img}
                          alt={trip.city}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        <div style={{
                          position: "absolute", top: 8, right: 8,
                          padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 700,
                          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", color: "var(--white)"
                        }}>
                          Featured
                        </div>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--white)" }}>{trip.city}, {trip.country}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{trip.days} Days Trip</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>₹{trip.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {}
            <Link href="/budget" style={{ textDecoration: "none", animation: "fadeUp 0.4s ease 0.5s both" }}>
              <div style={{ height: "100%", cursor: "pointer" }}>
                <BudgetChart />
              </div>
            </Link>
          </div>

          {}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 28 }}>

            {}
            <div className="glass" style={{ borderRadius: 18, padding: "22px 24px", animation: "fadeUp 0.4s ease 0.6s both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, margin: 0 }}>Upcoming Trips</h3>
                <Link href="/trips" style={{ textDecoration: "none" }}>
                  <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    See All <ArrowRight size={13} />
                  </span>
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentTrips.length > 0 ? recentTrips.map((trip, i) => {
                  const today = new Date(); today.setHours(0,0,0,0);
                  const startDate = new Date(trip.start_date); startDate.setHours(0,0,0,0);
                  const diffTime = startDate - today;
                  const daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  let dateLabel = "";
                  if (daysAway === 0) dateLabel = "Today!";
                  else if (daysAway > 0) dateLabel = `In ${daysAway} days`;
                  else dateLabel = "Active Now";

                  return (
                    <Link key={i} href="/trips" style={{ textDecoration: "none" }}>
                      <div
                        className="card-hover"
                        style={{
                          padding: "14px 16px", borderRadius: 14, display: "flex", alignItems: "center",
                          gap: 14, border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)", cursor: "pointer"
                        }}
                      >
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                          🏝️
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trip.destination} Trip</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                            {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span style={{ fontSize: 12, color: daysAway >= 0 ? "var(--gold)" : "#10b981", fontWeight: 600, flexShrink: 0 }}>
                          {dateLabel}
                        </span>
                      </div>
                    </Link>
                  )
                }) : (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 14 }}>No upcoming trips yet.</p>
                    <Link href="/chat" style={{ textDecoration: "none" }}>
                      <button className="btn-gold" style={{ padding: "10px 22px", borderRadius: 10, fontSize: 13 }}>Plan a Trip</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {}
            <div className="glass" style={{ borderRadius: 18, padding: "22px 24px", animation: "fadeUp 0.4s ease 0.7s both" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, margin: "0 0 18px 0" }}>Recent Activity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: i < ACTIVITY.length - 1 ? 14 : 0, borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bell size={13} color="#3b82f6" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--white)", lineHeight: 1.4 }}>{a.text}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--muted)" }}>{a.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}