"use client"
import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat"
import { logoutUser, getToken } from "@/lib/auth"
import { saveTrip } from "@/lib/api"
import ReactMarkdown from "react-markdown"
import CheckoutModal from "@/components/payment/CheckoutModal"
import Sidebar from "@/components/layout/Sidebar"
import TripMap from "@/components/map/TripMap"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { useVoice } from "@/hooks/useVoice"
import { useSidebar } from "@/context/SidebarContext"

// ── Day-by-Day Itinerary Parser ───────────────────────────
function parseItinerary(text) {
  // Match "Day 1", "Day 2 -", "**Day 3:**" etc.
  const dayRegex = /(?:^|\n)\*{0,2}Day\s*(\d+)\*{0,2}[:\s\-–]*/gi
  const parts = text.split(dayRegex)
  if (parts.length < 3) return null // No day structure found
  const days = []
  for (let i = 1; i < parts.length; i += 2) {
    days.push({ num: parts[i], content: (parts[i + 1] || "").trim() })
  }
  return days.length >= 2 ? days : null
}

function ItineraryAccordion({ days }) {
  const [open, setOpen] = useState(0)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {days.map((day, i) => (
        <div
          key={i}
          style={{
            borderRadius: 14,
            border: `1px solid ${open === i ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
            overflow: "hidden",
            transition: "border-color 0.2s",
          }}
        >
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            style={{
              width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: open === i ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
              border: "none", cursor: "pointer", transition: "background 0.2s",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: open === i ? "var(--gold)" : "var(--white)", fontFamily: "var(--font-display)" }}>
              ✦ Day {day.num}
            </span>
            <span style={{ color: "var(--muted)", fontSize: 13, transition: "transform 0.2s", display: "inline-block", transform: open === i ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
          </button>
          {open === i && (
            <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)", fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.8)" }}>
              <ReactMarkdown components={{
                strong: ({node, ...p}) => <strong style={{ fontWeight: 600, color: "var(--white)" }} {...p} />,
                p:      ({node, ...p}) => <p style={{ marginBottom: 6 }} {...p} />,
                li:     ({node, ...p}) => <li style={{ marginLeft: 16, marginBottom: 4 }} {...p} />,
              }}>
                {day.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ChatPageInner({ roomId = null }) {
  const { user, loading: authLoading } = useAuth()
  const { messages, loading, error, sendMessage, clearChat } = useChat(roomId)
  const searchParams = useSearchParams()

  const [input, setInput]             = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [currentTrip, setCurrentTrip] = useState(null)
  const [paymentDone, setPaymentDone] = useState(false)
  const [lastTripId, setLastTripId]   = useState(null)
  const [copied, setCopied]           = useState(false)
  const [mapOpen, setMapOpen]         = useState(true) // Map toggle
  const { isCollapsed }               = useSidebar()

  // Handle deep-linked destination from dashboard
  useEffect(() => {
    const dest = searchParams.get("destination")
    if (dest && messages.length <= 1 && !loading) {
      const prompt = `Plan a trip to ${dest}`
      setInput(prompt)
      // Auto-send slightly after mount to feel natural
      const timer = setTimeout(() => {
        sendMessage(prompt)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, messages.length, loading, sendMessage])

  const { isListening, toggleListening, error: voiceError } = useVoice((transcript) => {
    setInput(transcript)
    // Auto-submit after voice ends
    if (transcript.length > 2) {
      setTimeout(() => {
        handleSend(transcript)
      }, 500)
    }
  })

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const router    = useRouter()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const lastAIMessage = [...messages].reverse().find(m => m.role === "assistant")
  
  let currentDestination = "Custom Trip"
  if (lastAIMessage) {
    const destMatch = lastAIMessage.content?.match(/Trip Plan:\s*([^(\n]+)/i)
    if (destMatch && destMatch[1]) {
      currentDestination = destMatch[1].trim()
    }
  }

  const looksLikeTrip = (
    lastAIMessage?.content?.includes("Total Cost") ||
    lastAIMessage?.content?.includes("total cost") ||
    lastAIMessage?.content?.includes("Day 1") ||
    lastAIMessage?.content?.includes("₹") ||
    lastAIMessage?.content?.includes("Hotel:")
  )

  const handleSend = async (text) => {
    const messageText = text || input
    if (!messageText.trim() || loading) return
    setInput("")
    setPaymentDone(false)
    await sendMessage(messageText)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleMakePayment = async () => {
    try {
      // Extract total cost if presented
      let cost = 100000
      const costMatch = lastAIMessage?.content?.match(/Total Estimated:\s*[^\d]*([\d,]+)/i)
      if (costMatch && costMatch[1]) {
        cost = parseInt(costMatch[1].replace(/,/g, ""), 10)
      }

      const tripData = {
        destination: currentDestination, origin: "Home City",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        duration_days: 5, total_cost: cost, currency: "INR",
        ai_plan: { conversation: messages },
      }
      const saved = await saveTrip(tripData)
      setCurrentTrip({ id: saved?.trip?.id || null, total_cost: cost })
      setShowPayment(true)
    } catch {
      setCurrentTrip({ id: null, total_cost: 100000 })
      setShowPayment(true)
    }
  }

  const handlePaymentSuccess = (paymentIntentId) => {
    setShowPayment(false)
    setPaymentDone(true)
    setLastTripId(currentTrip?.id)
    sendMessage(`Payment successful! Payment ID: ${paymentIntentId}. Please confirm my booking and generate my trip summary.`)
  }

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/pdf/generate?trip_id=${lastTripId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      if (!res.ok) throw new Error("Failed")
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url; a.download = "tripai-ticket.pdf"; a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) { console.error("PDF error:", err) }
  }

  if (authLoading) return <LoadingScreen message="Preparing your AI travel assistant..." />

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)" }}>
      <div className="bg-ambient-glow" />
      <Sidebar />

      <div style={{ marginLeft: isCollapsed ? 80 : 260, transition: "margin-left 0.3s ease", display: "flex", height: "100vh" }}>

        {/* ── CHAT PANEL ── */}
        <div style={{
          flex: mapOpen ? "0 0 65%" : "1",
          display: "flex", flexDirection: "column",
          borderRight: mapOpen ? "1px solid var(--border)" : "none",
          transition: "flex 0.3s ease",
          minWidth: 0,
          position: "relative",
          maxWidth: "100%",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(2,6,23,0.6)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 50,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#0a0f1e",
              }}>AI</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--white)", lineHeight: 1 }}>TripAI Assistant</p>
                {roomId && <p style={{ fontSize: 11, color: "var(--gold)", marginTop: 2 }}>Multiplayer Session</p>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setMapOpen(o => !o)}
                style={{
                  fontSize: 12, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                  background: mapOpen ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
                  color: mapOpen ? "var(--gold)" : "var(--muted)",
                  border: `1px solid ${mapOpen ? "var(--border-gold)" : "var(--border)"}`,
                  transition: "all 0.2s",
                }}
              >
                {mapOpen ? "🗺️ Hide Map" : "🗺️ Show Map"}
              </button>

              {!roomId ? (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/multiplayer/room`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` } })
                      const data = await res.json()
                      if (data.room_id) router.push(`/chat/${data.room_id}`)
                    } catch(e) { console.error(e) }
                  }}
                  style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  🤝 Invite
                </button>
              ) : (
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  {copied ? "✓ Copied!" : "🔗 Copy Link"}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px 130px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

              {messages.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: 60, animation: "fadeUp 0.5s ease" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--white)", marginBottom: 8 }}>Where would you like to go?</h2>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>Tell me your dream destination and I'll plan everything — flights, hotels, and your full itinerary.</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10, animation: "fadeUp 0.3s ease" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#0a0f1e" }}>AI</div>
                  )}
                  <div style={{
                    maxWidth: "75%",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                    padding: msg.role === "user" ? "12px 16px" : "16px 20px",
                    fontSize: 14, lineHeight: 1.75,
                    background: msg.role === "user" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.04)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                    color: msg.role === "user" ? "#0a0f1e" : "var(--white)",
                    fontWeight: msg.role === "user" ? 500 : 400,
                    boxShadow: msg.role === "user" ? "0 4px 20px rgba(245,158,11,0.15)" : "none",
                  }}>
                    {msg.role === "assistant" ? (() => {
                      const days = parseItinerary(msg.content)
                      if (days) return (
                        <div>
                          <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>📋 Day-by-Day Itinerary</p>
                          <ItineraryAccordion days={days} />
                        </div>
                      )
                      return (
                        <ReactMarkdown components={{
                          h2:     ({node, ...p}) => <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, margin: "16px 0 6px", color: "var(--white)" }} {...p} />,
                          h3:     ({node, ...p}) => <h3 style={{ fontSize: 14, fontWeight: 600, margin: "12px 0 4px", color: "var(--gold)" }} {...p} />,
                          strong: ({node, ...p}) => <strong style={{ fontWeight: 600, color: "var(--white)" }} {...p} />,
                          p:      ({node, ...p}) => <p style={{ marginBottom: 8 }} {...p} />,
                          li:     ({node, ...p}) => <li style={{ marginLeft: 16, marginBottom: 4 }} {...p} />,
                          hr:     () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />,
                        }}>{msg.content}</ReactMarkdown>
                      )
                    })() : msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "var(--white)" }}>
                      {user?.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#0a0f1e", flexShrink: 0 }}>AI</div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 16px 16px 16px", padding: "14px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: `bounce-dot 1.2s ease ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}

              {error && <p style={{ textAlign: "center", fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 18px" }}>{error}</p>}

              {looksLikeTrip && !loading && !paymentDone && (
                <div style={{ display: "flex", paddingLeft: 40, animation: "fadeUp 0.4s ease" }}>
                  <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid var(--border-gold)", borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Your trip plan is ready!</p>
                      <button onClick={handleMakePayment} className="btn-gold" style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13 }}>💳 Book & Pay Now</button>
                    </div>
                    <p style={{ fontSize: 10, color: "var(--muted)", maxWidth: 90, lineHeight: 1.5 }}>Secured by Stripe · Test mode</p>
                  </div>
                </div>
              )}

              {paymentDone && (
                <div style={{ display: "flex", paddingLeft: 40, animation: "fadeUp 0.4s ease" }}>
                  <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 28 }}>✅</span>
                    <div>
                      <p style={{ fontWeight: 600, color: "#4ade80", marginBottom: 6 }}>Booking Confirmed!</p>
                      <button onClick={handleDownloadPDF} className="btn-gold" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13 }}>📄 Download PDF Ticket</button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input Bar */}
          <div className="floating-input-bar">
            <button onClick={toggleListening} title={isListening ? "Stop" : "Voice Planning"} style={{ width: 44, height: 44, borderRadius: "50%", background: isListening ? "var(--gold)" : "rgba(255,255,255,0.05)", border: isListening ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s", animation: isListening ? "voice-pulse 1.5s infinite" : "none", fontSize: 18, flexShrink: 0 }}>
              {isListening ? "🛑" : "🎙️"}
            </button>
            <textarea
              ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Plan a 5 day trip to Tokyo..."}
              rows={1} disabled={loading} className="input-dark"
              style={{ flex: 1, padding: "12px 16px", borderRadius: 12, resize: "none", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px" }}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="btn-gold" style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, flexShrink: 0 }}>
              {loading ? "..." : "Send"}
            </button>
          </div>

          {showPayment && currentTrip && (
            <CheckoutModal
              tripId={currentTrip.id}
              amountInr={currentTrip.total_cost || 100000}
              flightCost={(currentTrip.total_cost || 100000) * 0.40}
              hotelCost={(currentTrip.total_cost || 100000) * 0.60}
              onSuccess={handlePaymentSuccess}
              onClose={() => setShowPayment(false)}
            />
          )}
        </div>

        {/* ── MAP PANEL ── */}
        {mapOpen && (
          <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", minWidth: 0, animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Live Map</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--white)" }}>
                {currentDestination !== "Custom Trip" ? currentDestination : "Exploring the World"}
              </h2>
            </div>
            <div style={{ flex: 1, borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
              <TripMap destination={currentDestination} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ChatPage(props) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#020617" }} />}>
      <ChatPageInner {...props} />
    </Suspense>
  )
}
