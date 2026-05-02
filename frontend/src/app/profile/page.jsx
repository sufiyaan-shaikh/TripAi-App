"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getToken } from "@/lib/auth"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState({ full_name: "", nationality: "", phone: "" })
  const [prefs, setPrefs] = useState({
    preferred_flight_class: "Economy",
    preferred_hotel_stars: 4,
    preferred_transport: "Flight",
    preferred_hotel_type: "Hotel",
    dietary_requirements: "",
    preferred_currency: "INR",
    budget_range: "Medium",
  })
  const [profileMsg, setProfileMsg] = useState("")
  const [prefsMsg, setPrefsMsg]     = useState("")
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (!user) return
    const fetch_ = async () => {
      const res  = await fetch(`${BACKEND_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (data.profile)     setProfile({ full_name: data.profile.full_name || "", nationality: data.profile.nationality || "", phone: data.profile.phone || "" })
      if (data.preferences) setPrefs({ ...prefs, ...data.preferences })
    }
    fetch_()
  }, [user])

  const saveProfile = async () => {
    setSaving(true); setProfileMsg("")
    try {
      const res  = await fetch(`${BACKEND_URL}/api/user/profile`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(profile) })
      const data = await res.json()
      setProfileMsg(res.ok ? "Saved successfully" : data.detail || "Failed")
    } catch { setProfileMsg("Something went wrong") }
    finally { setSaving(false) }
  }

  const savePrefs = async () => {
    setSaving(true); setPrefsMsg("")
    try {
      const res  = await fetch(`${BACKEND_URL}/api/user/preferences`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(prefs) })
      const data = await res.json()
      setPrefsMsg(res.ok ? "Saved successfully" : data.detail || "Failed")
    } catch { setPrefsMsg("Something went wrong") }
    finally { setSaving(false) }
  }

  const ToggleGroup = ({ options, value, onChange }) => (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map(opt => (
        <button
          key={opt.value ?? opt} onClick={() => onChange(opt.value ?? opt)}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 10, fontSize: 13,
            fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.2s ease",
            background: (value === (opt.value ?? opt)) ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${(value === (opt.value ?? opt)) ? "transparent" : "var(--border)"}`,
            color: (value === (opt.value ?? opt)) ? "#0a0f1e" : "var(--muted)",
            fontWeight: (value === (opt.value ?? opt)) ? 600 : 400,
          }}
        >
          {opt.label ?? opt}
        </button>
      ))}
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--muted)" }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)" }}>

      {}
      <nav style={{
        borderBottom: "1px solid var(--border)", padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,15,30,0.8)", backdropFilter: "blur(12px)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>
          Trip<span className="gold-text">AI</span>
        </span>
        <button onClick={() => router.push("/dashboard")} className="nav-link">← Dashboard</button>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px", animation: "fadeUp 0.5s ease" }}>
        <p className="section-label" style={{ marginBottom: 8 }}>Account</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--white)", marginBottom: 8 }}>
          Your Profile
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 48 }}>
          This data personalises every trip the AI plans for you.
        </p>

        {}
        <div className="glass" style={{ borderRadius: 20, padding: "32px", marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
            Personal Info
          </p>

          {[
            { label: "Full Name", key: "full_name", placeholder: "John Doe" },
            { label: "Nationality", key: "nationality", placeholder: "e.g. Indian" },
            { label: "Phone", key: "phone", placeholder: "+91 9876543210" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 7 }}>{f.label}</label>
              <input
                value={profile[f.key]} placeholder={f.placeholder}
                onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                className="input-dark" style={{ padding: "11px 14px", borderRadius: 10 }}
              />
            </div>
          ))}

          {profileMsg && (
            <p style={{ fontSize: 13, color: profileMsg === "Saved successfully" ? "#4ade80" : "#f87171", marginBottom: 16 }}>
              {profileMsg === "Saved successfully" ? "✓ " : ""}{profileMsg}
            </p>
          )}

          <button onClick={saveProfile} disabled={saving} className="btn-gold" style={{ padding: "11px 28px", borderRadius: 10, fontSize: 14 }}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {}
        <div className="glass" style={{ borderRadius: 20, padding: "32px" }}>
          <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
            Travel Preferences
          </p>

          {[
            { label: "Flight Class", key: "preferred_flight_class", opts: ["Economy", "Business", "First"] },
            { label: "Transport", key: "preferred_transport", opts: ["Flight", "Train", "Both"] },
            { label: "Budget", key: "budget_range", opts: ["Budget", "Medium", "Luxury"] },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{f.label}</label>
              <ToggleGroup options={f.opts} value={prefs[f.key]} onChange={v => setPrefs({ ...prefs, [f.key]: v })} />
            </div>
          ))}

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>Hotel Stars</label>
            <ToggleGroup
              options={[{ label: "★★★", value: 3 }, { label: "★★★★", value: 4 }, { label: "★★★★★", value: 5 }]}
              value={prefs.preferred_hotel_stars}
              onChange={v => setPrefs({ ...prefs, preferred_hotel_stars: v })}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 7 }}>Preferred Currency</label>
            <select
              value={prefs.preferred_currency}
              onChange={e => setPrefs({ ...prefs, preferred_currency: e.target.value })}
              className="input-dark" style={{ padding: "11px 14px", borderRadius: 10 }}
            >
              {[["INR","Indian Rupee"],["USD","US Dollar"],["EUR","Euro"],["GBP","British Pound"],["AED","UAE Dirham"]].map(([v, l]) => (
                <option key={v} value={v}>{v} — {l}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 7 }}>Dietary Requirements</label>
            <input
              value={prefs.dietary_requirements} placeholder="e.g. Vegetarian, Halal"
              onChange={e => setPrefs({ ...prefs, dietary_requirements: e.target.value })}
              className="input-dark" style={{ padding: "11px 14px", borderRadius: 10 }}
            />
          </div>

          {prefsMsg && (
            <p style={{ fontSize: 13, color: prefsMsg === "Saved successfully" ? "#4ade80" : "#f87171", marginBottom: 16 }}>
              {prefsMsg === "Saved successfully" ? "✓ " : ""}{prefsMsg}
            </p>
          )}

          <button onClick={savePrefs} disabled={saving} className="btn-gold" style={{ padding: "11px 28px", borderRadius: 10, fontSize: 14 }}>
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  )
}