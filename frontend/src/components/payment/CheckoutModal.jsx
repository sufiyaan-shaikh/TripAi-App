"use client"
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { createPaymentIntent, confirmPayment } from "@/lib/api"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function PaymentForm({ breakdown, onSuccess, onClose }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError]           = useState("")

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setProcessing(true); setError("")
    try {
      const { error: submitError } = await elements.submit()
      if (submitError) { setError(submitError.message); setProcessing(false); return }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements, redirect: "if_required",
      })
      if (confirmError) { setError(confirmError.message); setProcessing(false); return }

      if (paymentIntent.status === "succeeded") {
        await confirmPayment(paymentIntent.id)
        onSuccess(paymentIntent.id)
      }
    } catch { setError("Payment failed. Please try again."); setProcessing(false) }
  }

  const Row = ({ label, value, bold }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13, color: bold ? "var(--white)" : "var(--muted)", fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: 13, color: bold ? "var(--gold)" : "var(--muted)", fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Breakdown */}
      <div className="glass" style={{ borderRadius: 14, padding: "20px" }}>
        <Row label="✈ Flights"        value={`₹${Number(breakdown.flight_cost||0).toLocaleString("en-IN")}`} />
        <Row label="🏨 Hotels"         value={`₹${Number(breakdown.hotel_cost||0).toLocaleString("en-IN")}`} />
        <Row label="Tax (5%)"          value={`₹${Number(breakdown.tax_inr||0).toLocaleString("en-IN")}`} />
        <Row label="Platform fee (2%)" value={`₹${Number(breakdown.platform_fee_inr||0).toLocaleString("en-IN")}`} />
        <Row label="Total"             value={`₹${Number(breakdown.total_inr||0).toLocaleString("en-IN")}`} bold />
        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
          Charged in USD via Stripe · Displayed in INR
        </p>
      </div>

      {/* Card element */}
      <div className="glass" style={{ borderRadius: 14, padding: "20px" }}>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {/* Test hint */}
      <div style={{
        background: "rgba(245,158,11,0.06)", border: "1px solid var(--border-gold)",
        borderRadius: 12, padding: "14px 16px",
      }}>
        <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, marginBottom: 4 }}>🧪 Test Mode</p>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          Card: <span style={{ fontFamily: "monospace", color: "var(--white)" }}>4242 4242 4242 4242</span>
          &nbsp;· Any future expiry · Any CVC
        </p>
      </div>

      {error && (
        <p style={{
          fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px",
        }}>{error}</p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} disabled={processing} className="btn-ghost" style={{ flex: 1, padding: "13px", borderRadius: 12, fontSize: 14 }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={processing || !stripe} className="btn-gold" style={{ flex: 2, padding: "13px", borderRadius: 12, fontSize: 14 }}>
          {processing ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="loading-aeroplane" style={{ fontSize: 16, color: "#0a0f1e" }}>✈️</span>
              Processing...
            </span>
          ) : `Pay ₹${Number(breakdown.total_inr||0).toLocaleString("en-IN")}`}
        </button>
      </div>
    </div>
  )
}

export default function CheckoutModal({ tripId, amountInr, flightCost, hotelCost, onSuccess, onClose }) {
  const [clientSecret, setClientSecret] = useState("")
  const [breakdown, setBreakdown]       = useState({})
  const [loadError, setLoadError]       = useState("")

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "unset" }
  }, [])

  useEffect(() => {
    if (!amountInr) return
    const init = async () => {
      try {
        const data = await createPaymentIntent(String(tripId||""), Number(amountInr), Number(flightCost||0), Number(hotelCost||0))
        setClientSecret(data.client_secret)
        setBreakdown(data)
      } catch { setLoadError("Failed to initialise payment. Please try again.") }
    }
    init()
  }, [tripId, amountInr])

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div style={{
        background: "var(--navy-2)", border: "1px solid var(--border)",
        borderRadius: 24, width: "100%", maxWidth: 440,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        animation: "fadeUp 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--white)" }}>
              Complete Payment
            </p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Secured by Stripe</p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 16, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "24px 28px 28px" }}>
          {loadError && (
            <p style={{ fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              {loadError}
            </p>
          )}

          {!clientSecret && !loadError && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 14 }}>
              <div className="loading-aeroplane">✈️</div>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Initialising payment...</p>
            </div>
          )}

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#f59e0b", colorBackground: "#1e293b", colorText: "#f8fafc", borderRadius: "8px" } } }}>
              <PaymentForm breakdown={breakdown} onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}