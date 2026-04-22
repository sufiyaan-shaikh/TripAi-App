"use client"
import React from "react"
import Sidebar from "@/components/layout/Sidebar"
import { useSidebar } from "@/context/SidebarContext"
import { MapPin, Globe, Compass } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DestinationsPage() {
  const { isCollapsed } = useSidebar()
  const router = useRouter()

  const featured = [
    { name: "Paris", info: "The City of Lights", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80" },
    { name: "Rome", info: "Eternal History", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80" },
    { name: "Santorini", info: "Blue Horizons", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=80" },
    { name: "New York", info: "The Concrete Jungle", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", color: "var(--white)" }}>
      <Sidebar />
      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", padding: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Explore <span className="gold-text">Destinations</span></h1>
        <p style={{ color: "var(--muted)", marginBottom: 40 }}>Find inspiration for your next incredible journey.</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {featured.map((dest, i) => (
            <div 
              key={i} 
              className="glass card-hover" 
              onClick={() => router.push(`/chat?destination=${dest.name}`)}
              style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer" }}
            >
              <div style={{ height: 180 }}>
                <img src={dest.img} alt={dest.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{dest.name}</h3>
                <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: 13 }}>{dest.info}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
