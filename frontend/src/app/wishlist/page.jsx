"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { useSidebar } from "@/context/SidebarContext"

// Unsplash cover images by keyword for popular cities
function getCoverUrl(destination) {
  const encoded = encodeURIComponent(destination + " city travel")
  return `https://source.unsplash.com/400x240/?${encoded}`
}

export default function WishlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [items, setItems]     = useState([])
  const [search, setSearch]   = useState("")
  const [adding, setAdding]   = useState(false)
  const [input, setInput]     = useState({ destination: "", country: "" })
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const inputRef = useRef(null)
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    if (!loading && user) {
      getWishlist()
        .then(data => setItems(data.items || []))
        .catch(console.error)
        .finally(() => setDataLoading(false))
    }
  }, [loading, user])

  const handleAdd = async () => {
    if (!input.destination.trim() || saving) return
    setSaving(true)
    try {
      const data = await addToWishlist(input.destination.trim(), input.country.trim())
      setItems(prev => [data.item, ...prev])
      setInput({ destination: "", country: "" })
      setAdding(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      await removeFromWishlist(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const displayed = search.trim()
    ? items.filter(i => i.destination?.toLowerCase().includes(search.toLowerCase()))
    : items

  if (loading || dataLoading) return <LoadingScreen message="Loading your bucket list..." />

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-ambient-glow"><div className="extra-glow" /></div>
      <Sidebar />

      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", padding: "80px 40px 60px", maxWidth: 1100, margin: "0 auto 0 auto", paddingLeft: isCollapsed ? 120 : 300 }}>

        {/* Header */}
        <div style={{ marginBottom: 40, animation: "fadeUp 0.5s ease" }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Bucket List</p>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700,
            color: "var(--white)", letterSpacing: "-0.03em", marginBottom: 12,
          }}>
            Your <span style={{ background: "linear-gradient(to right, var(--gold), var(--gold-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Wishlist</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16 }}>Save destinations for later and plan them when you're ready.</p>
        </div>

        {/* Search + Add */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, animation: "fadeUp 0.5s ease 0.1s both" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search wishlist..."
            className="input-dark"
            style={{ flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 14 }}
          />
          <button
            onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 100) }}
            className="btn-gold"
            style={{ padding: "10px 20px", borderRadius: 12, fontSize: 14 }}
          >
            + Add Destination
          </button>
        </div>

        {/* Add Form */}
        {adding && (
          <div className="glass" style={{
            borderRadius: 20, padding: 24, marginBottom: 32,
            border: "1px solid var(--border-gold)", animation: "fadeUp 0.3s ease"
          }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--white)", marginBottom: 16 }}>Add to Wishlist</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                ref={inputRef}
                value={input.destination}
                onChange={e => setInput(p => ({ ...p, destination: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="Destination (e.g. Paris)"
                className="input-dark"
                style={{ flex: 2, minWidth: 180, padding: "10px 16px", borderRadius: 10, fontSize: 14 }}
              />
              <input
                value={input.country}
                onChange={e => setInput(p => ({ ...p, country: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="Country (optional)"
                className="input-dark"
                style={{ flex: 1, minWidth: 140, padding: "10px 16px", borderRadius: 10, fontSize: 14 }}
              />
              <button onClick={handleAdd} disabled={saving} className="btn-gold" style={{ padding: "10px 20px", borderRadius: 10, fontSize: 14 }}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setAdding(false)} style={{ padding: "10px 16px", borderRadius: 10, fontSize: 14, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {displayed.length === 0 ? (
          <div className="glass" style={{ borderRadius: 20, padding: 60, textAlign: "center", border: "1px dashed var(--border)" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>❤️</div>
            <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 20 }}>
              {search ? "No destinations match your search." : "Your wishlist is empty. Add your dream destinations!"}
            </p>
            <button className="btn-gold" onClick={() => { setAdding(true); setSearch("") }} style={{ padding: "12px 24px", borderRadius: 12 }}>
              Add your first destination →
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {displayed.map((item, i) => (
              <div
                key={item.id || i}
                className="glass card-hover"
                style={{ borderRadius: 20, overflow: "hidden", animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}
              >
                {/* Cover image */}
                <div style={{
                  height: 160, background: "rgba(255,255,255,0.04)",
                  backgroundImage: `url('https://source.unsplash.com/400x200/?${encodeURIComponent(item.destination + " city")}')`,
                  backgroundSize: "cover", backgroundPosition: "center", position: "relative",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(2,6,23,0.8) 0%, transparent 60%)"
                  }} />
                  <button
                    onClick={() => handleRemove(item.id)}
                    style={{
                      position: "absolute", top: 12, right: 12,
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(2,6,23,0.6)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
                      color: "#f87171", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title="Remove from wishlist"
                  >
                    ×
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: "16px 20px 20px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--white)", marginBottom: 4 }}>
                    {item.destination}
                  </h3>
                  {item.country && (
                    <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>📍 {item.country}</p>
                  )}
                  <button
                    onClick={() => router.push(`/chat?destination=${encodeURIComponent(item.destination)}`)}
                    className="btn-gold"
                    style={{ width: "100%", padding: "10px", borderRadius: 10, fontSize: 13 }}
                  >
                    Plan This Trip →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
