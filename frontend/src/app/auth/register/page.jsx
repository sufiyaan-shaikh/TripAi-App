"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser, saveTokens, saveUser } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ fullName: "", email: "", password: "", confirm: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (form.password.length < 8) return setError("Password must be at least 8 characters.")
    if (form.password !== form.confirm) return setError("Passwords do not match.")
    setLoading(true)
    try {
      const data = await registerUser(form.email, form.password, form.fullName)
      if (data.access_token) {
        saveTokens(data.access_token, null)
        saveUser(data.user)
        router.push("/dashboard")
      } else {
        router.push("/auth/login?registered=true")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: "Full name", name: "fullName", type: "text", placeholder: "John Doe" },
    { label: "Email address", name: "email", type: "email", placeholder: "you@example.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Min. 8 characters" },
    { label: "Confirm password", name: "confirm", type: "password", placeholder: "••••••••" },
  ]

  return (
    <div style={{
      minHeight: "100vh", background: "var(--navy)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp 0.5s ease" }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>
            Trip<span className="gold-text">AI</span>
          </span>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: "40px 36px" }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Get started</p>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600,
            color: "var(--white)", letterSpacing: "-0.01em", marginBottom: 28,
          }}>
            Create your account
          </h2>

          <form onSubmit={handleSubmit}>
            {fields.map((f, i) => (
              <div key={f.name} style={{ marginBottom: i === fields.length - 1 ? 24 : 18 }}>
                <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 7, fontWeight: 500 }}>
                  {f.label}
                </label>
                <input
                  type={f.type} name={f.name}
                  value={form[f.name]} onChange={handleChange}
                  required placeholder={f.placeholder}
                  className="input-dark"
                  style={{ padding: "11px 14px", borderRadius: 10 }}
                />
              </div>
            ))}

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "11px 14px", marginBottom: 20,
              }}>
                <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-gold"
              style={{ width: "100%", padding: "13px", borderRadius: 10, fontSize: 15 }}
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)", marginTop: 20 }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}