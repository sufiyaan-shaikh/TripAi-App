"use client"

const QUOTES = [
  { text: "The world is a book, and those who do not travel read only one page.", author: "Saint Augustine" },
  { text: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "Life is short and the world is wide.", author: "Simon Raven" },
]

const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

export default function LoadingScreen({ message = "Loading your travel hub..." }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--navy)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>

      {}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 60% 40% at 50% 30%, rgba(245,158,11,0.08) 0%, transparent 70%),
          radial-gradient(ellipse 40% 60% at 20% 80%, rgba(59,130,246,0.05) 0%, transparent 60%)
        `,
      }} />

      {}
      <div style={{ position: "relative", width: 160, height: 160, marginBottom: 48 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute",
            inset: `${i * 20}px`,
            borderRadius: "50%",
            border: `1px solid rgba(245,158,11,${0.15 - i * 0.04})`,
            animation: `ping-ring 2s ease-out ${i * 0.4}s infinite`,
          }} />
        ))}

        {}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "spin-compass 12s linear infinite",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(2,6,23,0.5))",
            border: "1px solid rgba(245,158,11,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(245,158,11,0.15) inset",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))" }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </div>
        </div>
      </div>

      {}
      <div style={{ marginBottom: 8, animation: "fadeUp 0.6s ease" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--white)" }}>
          Trip<span style={{ color: "var(--gold)" }}>AI</span>
        </span>
      </div>

      {}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 56, animation: "fadeUp 0.6s ease 0.1s both" }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>{message}</p>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "var(--gold)",
              animation: `bounce-dot 1.2s ease ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {}
      <div style={{
        maxWidth: 420, textAlign: "center",
        padding: "24px 32px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        animation: "fadeUp 0.6s ease 0.2s both",
      }}>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 12 }}>
          "{quote.text}"
        </p>
        <p style={{ fontSize: 12, color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
          — {quote.author}
        </p>
      </div>

      {}
      <style>{`
        @keyframes ping-ring {
          0%   { transform: scale(0.8); opacity: 0.6; }
          70%  { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes spin-compass {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
