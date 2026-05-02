"use client"
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { createPaymentIntent, confirmPayment, getStripeConfig } from "@/lib/api"
import { Lock, ShieldCheck, Ticket, CreditCard, ChevronRight } from "lucide-react"

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
    } catch (err) { 
      setError(err.message || "Payment failed. Please try again."); 
      setProcessing(false) 
    }
  }

  const Row = ({ label, value, bold, gold }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: bold ? "none" : "1px dashed rgba(255,255,255,0.1)" }}>
      <span style={{ fontSize: 14, color: bold ? "var(--white)" : "var(--muted)", fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 14, color: gold ? "var(--gold)" : (bold ? "var(--white)" : "var(--muted)"), fontWeight: bold ? 700 : 500, fontFamily: bold ? "var(--font-display)" : "inherit" }}>{value}</span>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* PREMIUM RECEIPT CARD */}
      <div style={{
        background: "linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))",
        borderRadius: 20, position: "relative", overflow: "hidden",
        border: "1px solid var(--border-gold)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
      }}>
        {/* Ticket Top Ribbon */}
        <div style={{ background: "rgba(245,158,11,0.15)", padding: "12px 24px", borderBottom: "1px dashed var(--border-gold)", display: "flex", alignItems: "center", gap: 10 }}>
          <Ticket size={18} color="var(--gold)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>VIP Travel Pass</span>
        </div>
        
        {/* Breakdown */}
        <div style={{ padding: "16px 24px" }}>
          <Row label="Flights (First/Business)" value={`₹${Number(breakdown.flight_cost||0).toLocaleString("en-IN")}`} />
          <Row label="Premium Stay"         value={`₹${Number(breakdown.hotel_cost||0).toLocaleString("en-IN")}`} />
          <Row label="Taxes & Duties (5%)"  value={`₹${Number(breakdown.tax_inr||0).toLocaleString("en-IN")}`} />
          <Row label="Concierge Fee (2%)"   value={`₹${Number(breakdown.platform_fee_inr||0).toLocaleString("en-IN")}`} />
        </div>

        {/* Total Section with Cutouts */}
        <div style={{
          position: "relative", padding: "20px 24px",
          background: "rgba(0,0,0,0.2)", borderTop: "2px dashed rgba(245,158,11,0.3)"
        }}>
          {/* Perforated edge cutouts */}
          <div style={{ position: "absolute", top: -12, left: -12, width: 24, height: 24, borderRadius: "50%", background: "var(--navy-2)", borderRight: "1px solid var(--border-gold)" }} />
          <div style={{ position: "absolute", top: -12, right: -12, width: 24, height: 24, borderRadius: "50%", background: "var(--navy-2)", borderLeft: "1px solid var(--border-gold)" }} />
          
          <Row label="Total Amount" value={`₹${Number(breakdown.total_inr||0).toLocaleString("en-IN")}`} bold gold />
          <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8, margin: 0 }}>
            Processed securely in USD via Stripe
          </p>
        </div>
      </div>

      {/* STRIPE ELEMENT */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: "24px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <CreditCard size={18} color="var(--white)" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--white)" }}>Payment Details</span>
        </div>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {/* TEST MODE BANNER */}
      <div style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 14, padding: "16px", display: "flex", alignItems: "flex-start", gap: 12
      }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ShieldCheck size={16} color="var(--gold)" />
        </div>
        <div>
          <p style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, marginBottom: 4, margin: 0 }}>Test Environment Active</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
            Use card <span style={{ fontFamily: "monospace", color: "var(--white)", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>4242 4242 4242 4242</span> with any expiry/CVC to simulate a successful payment.
          </p>
        </div>
      </div>

      {error && (
        <p style={{
          fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px",
        }}>{error}</p>
      )}

      {/* ACTION BUTTONS & TRUST BADGES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} disabled={processing} className="btn-ghost" style={{ flex: 1, padding: "16px", borderRadius: 14, fontSize: 15, fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={processing || !stripe} className="btn-gold" style={{ flex: 2, padding: "16px", borderRadius: 14, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.3s ease" }}>
            {processing ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span className="loading-aeroplane" style={{ fontSize: 20 }}>✈️</span>
                Authorizing...
              </span>
            ) : (
              <>
                Confirm & Pay <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
        
        {/* Trust Indicators */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, opacity: 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--white)" }}>
            <Lock size={12} /> Bank-Level Encryption
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--white)" }}>
            <ShieldCheck size={12} /> Secure Checkout
          </div>
        </div>
      </div>

    </div>
  )
}

export default function CheckoutModal({ tripId, amountInr, flightCost, hotelCost, onSuccess, onClose }) {
  const [clientSecret, setClientSecret] = useState("")
  const [breakdown, setBreakdown]       = useState({})
  const [loadError, setLoadError]       = useState("")
  const [stripePromise, setStripePromise] = useState(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "unset" }
  }, [])

  useEffect(() => {
    if (!amountInr) return
    const init = async () => {
      try {
        const config = await getStripeConfig()
        setStripePromise(loadStripe(config.publishable_key))

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
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div style={{
        background: "var(--navy-2)", border: "1px solid var(--border)",
        borderRadius: 24, width: "100%", maxWidth: 500,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)"
      }}>
        
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "24px 32px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--white)", margin: 0 }}>
              Secure Checkout
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, margin: "4px 0 0 0" }}>Finalize your booking securely.</p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 18, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "32px" }}>
          {loadError && (
            <p style={{ fontSize: 14, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              {loadError}
            </p>
          )}

          {!clientSecret && !loadError && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 16 }}>
              <div className="loading-aeroplane" style={{ fontSize: 40 }}>✈️</div>
              <p style={{ fontSize: 15, color: "var(--muted)", fontWeight: 500 }}>Preparing your secure gateway...</p>
            </div>
          )}

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#f59e0b", colorBackground: "#1e293b", colorText: "#f8fafc", borderRadius: "12px", fontFamily: "inherit" } } }}>
              <PaymentForm breakdown={breakdown} onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}