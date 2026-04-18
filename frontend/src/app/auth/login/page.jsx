"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginUser, saveTokens, saveUser } from "@/lib/auth"

const SLIDES = [
  { src: "/slides/tokyo_ai_login_1776142274099.png", city: "Tokyo", country: "Japan" },
  { src: "/slides/paris_ai_login_1776142654403.png", city: "Paris", country: "France" },
  { src: "/slides/santorini_ai_login_1776142684987.png", city: "Santorini", country: "Greece" },
  { src: "/slides/bali_ai_login_1776142756018.png", city: "Bali", country: "Indonesia" },
  { src: "/slides/new_york_ai_login_1776142870306.png", city: "New York", country: "USA" },
  { src: "/slides/rome_ai_login_1776142892898.png", city: "Rome", country: "Italy" },
  { src: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1600&auto=format&fit=crop&q=80", city: "Amsterdam", country: "Netherlands" },
  { src: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&auto=format&fit=crop&q=80", city: "Barcelona", country: "Spain" },
  { src: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600&auto=format&fit=crop&q=80", city: "Prague",    country: "Czech Republic" },
  { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&auto=format&fit=crop&q=80", city: "Hạ Long Bay", country: "Vietnam" },
]

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: "", password: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [slide, setSlide]     = useState(0)
  const [fade, setFade]       = useState(true)

  // Auto-advance slideshow every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setSlide(prev => (prev + 1) % SLIDES.length)
        setFade(true)
      }, 700) // fade out, then swap image, then fade in
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const data = await loginUser(form.email, form.password)
      saveTokens(data.access_token, data.refresh_token)
      saveUser(data.user)
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--navy)",
      display: "flex", position: "relative", overflow: "hidden",
    }}>

      {/* Background ambient glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(245,158,11,0.06) 0%, transparent 60%)",
      }} />

      {/* ── Left panel: Form ── */}
      <div style={{
        width: "100%", maxWidth: 480, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 48px", zIndex: 10,
      }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--white)" }}>
            Trip<span className="gold-text">AI</span>
          </span>
        </div>

        <div style={{ animation: "fadeUp 0.5s ease" }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Welcome back</p>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700,
            color: "var(--white)", letterSpacing: "-0.01em", marginBottom: 32,
          }}>
            Sign in to start planning
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>
                Email address
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com"
                className="input-dark" style={{ padding: "14px 16px", borderRadius: 12 }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} required placeholder="••••••••"
                className="input-dark" style={{ padding: "14px 16px", borderRadius: 12 }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12, padding: "14px 16px", marginBottom: 20,
              }}>
                <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading} className="btn-gold"
              style={{ width: "100%", padding: "16px", borderRadius: 12, fontSize: 15 }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)", marginTop: 24 }}>
            No account?{" "}
            <Link href="/auth/register" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel: Crossfade Slideshow ── */}
      <div className="hidden-mobile" style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* All slides stacked, only active one is visible */}
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url('${s.src}')`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: i === slide ? (fade ? 1 : 0) : 0,
              transition: "opacity 0.7s ease-in-out",
            }}
          />
        ))}

        {/* Left navy fade blending into the form */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to right, var(--navy) 0%, rgba(10,15,30,0.3) 50%, transparent 100%)",
        }} />

        {/* Bottom overlay for city label */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(10,15,30,0.9) 0%, transparent 100%)",
          padding: "48px 40px 36px",
        }}>
          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFade(false); setTimeout(() => { setSlide(i); setFade(true) }, 300) }}
                style={{
                  width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === slide ? "var(--gold)" : "rgba(255,255,255,0.3)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.4s ease",
                }}
              />
            ))}
          </div>

          {/* City badge */}
          <div style={{
            opacity: fade ? 1 : 0, transition: "opacity 0.5s ease",
          }}>
            <p style={{ fontSize: 12, color: "rgba(245,158,11,0.8)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
              📍 {SLIDES[slide].country}
            </p>
            <h3 style={{
              fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700,
              color: "var(--white)", margin: 0, letterSpacing: "-0.01em",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}>
              {SLIDES[slide].city}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
