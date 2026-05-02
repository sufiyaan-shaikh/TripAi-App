"use client"
import dynamic from 'next/dynamic'

const TripMapClient = dynamic(() => import('./TripMapClient'), { 
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid var(--border)" }}>
      <div className="loading-aeroplane">✈️</div>
    </div>
  )
})

export default function TripMap({ destination }) {
  return <TripMapClient destination={destination} />
}
