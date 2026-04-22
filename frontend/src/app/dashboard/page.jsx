"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getTripStats, getTripHistory } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { useSidebar } from "@/context/SidebarContext"

// New Dashboard Components
import StatsCard from "@/components/dashboard/StatsCard"
import RecommendationCard from "@/components/dashboard/RecommendationCard"
import BudgetChart from "@/components/dashboard/BudgetChart"
import { Search, Bell, Plus } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { isCollapsed } = useSidebar()
  
  const [stats, setStats] = useState({
    trips_planned: 0,
    countries_visited: 0,
    places_saved: 0,
    upcoming_trips: 0
  })
  const [recentTrips, setRecentTrips] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      Promise.all([getTripStats(), getTripHistory()])
        .then(([statsData, historyData]) => {
          setStats(statsData)
          setRecentTrips(historyData.trips?.slice(0, 3) || [])
        })
        .catch(console.error)
        .finally(() => setDataLoading(false))
    }
  }, [loading, user])

  if (loading || dataLoading) return <LoadingScreen message="Unlocking your travel portal..." />

  const recommendedTrips = [
    { city: "Bali", country: "Indonesia", days: 7, price: 85000, imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" },
    { city: "Swiss Alps", country: "Switzerland", days: 6, price: 120000, imageUrl: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=400&q=80" },
    { city: "Tokyo", country: "Japan", days: 5, price: 95000, imageUrl: "https://images.unsplash.com/photo-1540959733332-e94667c61461?auto=format&fit=crop&w=400&q=80" },
  ]

  const recentActivites = [
    { text: "Added Bali to wishlist", date: "2 May 2025" },
    { text: "Created new itinerary for Switzerland", date: "30 Apr 2025" },
    { text: "Budget updated for Japan trip", date: "28 Apr 2025" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", color: "var(--white)" }}>
      <Sidebar />
      
      <div style={{ 
        marginLeft: isCollapsed ? 80 : 260, 
        transition: "margin-left 0.3s ease",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {/* HEADER */}
        <header style={{ 
          padding: "24px 40px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          background: "rgba(2, 6, 23, 0.5)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Hello, {user?.full_name?.split(" ")[0] || "Traveller"}! 👋</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Where would you like to explore today?</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
             <button className="glass" style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", cursor: "pointer" }}>
                <Search size={18} color="var(--muted)" />
             </button>
             <button className="glass" style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", cursor: "pointer" }}>
                <Bell size={18} color="var(--muted)" />
             </button>
             <button className="btn-gold" onClick={() => router.push("/chat")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12 }}>
                <Plus size={18} />
                <span>New Trip</span>
             </button>
          </div>
        </header>

        <main style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* STATS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            <StatsCard label="Trips Planned" value={stats.trips_planned} iconName="LayoutDashboard" color="#3b82f6" delay={0.1} />
            <StatsCard label="Countries Visited" value={stats.countries_visited} iconName="Map" color="#10b981" delay={0.2} />
            <StatsCard label="Places Saved" value={stats.places_saved} iconName="MapPin" color="#f59e0b" delay={0.3} />
            <StatsCard label="Upcoming Trips" value={stats.upcoming_trips} iconName="Calendar" color="#ef4444" delay={0.4} />
          </div>

          {/* SECOND ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 32 }}>
            
            {/* Left: Recommended */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, margin: 0 }}>Recommended for You</h3>
                <button style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>View All</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {recommendedTrips.map((trip, i) => (
                  <RecommendationCard key={i} {...trip} delay={0.5 + i * 0.1} />
                ))}
              </div>
            </div>

            {/* Right: Budget */}
            <div style={{ animation: "fadeUp 0.4s ease 0.6s both" }}>
               <BudgetChart />
            </div>

          </div>

          {/* THIRD ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 32 }}>
            
            {/* Left: Upcoming Trips */}
            <div className="glass" style={{ borderRadius: 20, padding: 24, animation: "fadeUp 0.4s ease 0.7s both" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, margin: "0 0 20px 0" }}>Upcoming Trips</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {recentTrips.length > 0 ? recentTrips.map((trip, i) => (
                  <div key={i} className="glass" style={{ padding: 16, borderRadius: 16, display: "flex", alignItems: "center", gap: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 60, height: 60, borderRadius: 12, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      🏝️
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{trip.destination} Trip</p>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>In {Math.ceil((new Date(trip.start_date) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>No upcoming trips scheduled.</p>
                )}
              </div>
            </div>

            {/* Right: Recent Activity */}
            <div className="glass" style={{ borderRadius: 20, padding: 24, animation: "fadeUp 0.4s ease 0.8s both" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, margin: "0 0 20px 0" }}>Recent Activity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {recentActivites.map((activity, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 12, borderBottom: i < recentActivites.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                       <Bell size={14} color="#3b82f6" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, color: "var(--white)" }}>{activity.text}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{activity.date}</p>
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