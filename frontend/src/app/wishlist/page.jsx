"use client"
import React, { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import { useSidebar } from "@/context/SidebarContext"
import { MapPin, Globe, Compass, Trash2, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { getWishlist, removeFromWishlist } from "@/lib/api"
import LoadingScreen from "@/components/ui/LoadingScreen"

export default function WishlistPage() {
  const { isCollapsed } = useSidebar()
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await getWishlist()
      setItems(data.items || [])
    } catch (err) {
      setError("Failed to load your saved places.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await removeFromWishlist(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      alert("Failed to remove item.")
    }
  }

  if (loading) return <LoadingScreen message="Unlocking your saved places..." />

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", color: "var(--white)" }}>
      <Sidebar />
      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", padding: 40, maxWidth: 1200, margin: "0 auto", paddingLeft: isCollapsed ? 120 : 300 }}>

        <div style={{ marginBottom: 40, animation: "fadeUp 0.5s ease" }}>
          <p className="section-label" style={{ marginBottom: 8 }}>My Collection</p>
          <h1 style={{ 
            fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 700, 
            letterSpacing: "-0.02em", margin: 0 
          }}>
            Saved <span className="gold-text">Places</span>
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 16 }}>
            {items.length} destination{items.length !== 1 ? "s" : ""} you want to explore.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="glass" style={{ padding: "60px 40px", borderRadius: 24, textAlign: "center", border: "1px dashed var(--border)" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📍</div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Your wishlist is empty</h2>
            <p style={{ color: "var(--muted)", maxWidth: 300, margin: "0 auto 24px" }}>
              Save destinations while chatting with the AI to see them here!
            </p>
            <button 
              className="btn-gold" 
              onClick={() => router.push("/chat")}
              style={{ padding: "10px 24px", borderRadius: 12 }}
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {items.map((item, i) => (
              <div 
                key={item.id} 
                className="glass card-hover" 
                onClick={() => router.push(`/chat?destination=${encodeURIComponent(item.destination)}`)}
                style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", animation: `fadeUp 0.4s ease ${i * 0.1}s both`, position: "relative" }}
              >
                <div style={{ height: 160, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                  🏝️
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{item.destination}</h3>
                      <p style={{ margin: "4px 0 0 0", color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>{item.country || "Explore with AI"}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#f87171", padding: 8, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#ef444422"}
                      onMouseLeave={e => e.currentTarget.style.background = "#ef444411"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {item.notes && (
                    <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{item.notes}</p>
                  )}
                  <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8, color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                    Plan this trip <ExternalLink size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
