import { useEffect, useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

const MAP_THEMES = {
  voyager: {
    label: "Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  dark: {
    label: "Midnight",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  light: {
    label: "Soft Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  terrain: {
    label: "Detailed",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
}

const WMO_CODES = {
  0: { label: "Clear Sky", icon: "☀️" },
  1: { label: "Mainly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  61: { label: "Light Rain", icon: "🌧️" },
  63: { label: "Moderate Rain", icon: "🌧️" },
  71: { label: "Light Snow", icon: "🌨️" },
  80: { label: "Rain Showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
}

function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: "Unknown", icon: "🌡️" }
}

// Create a premium gold marker using SVG
const createGoldIcon = (label) => {
  return new L.DivIcon({
    className: "custom-gold-marker",
    html: `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; animation: marker-drop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
        <div style="position: absolute; width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; box-shadow: 0 0 15px #f59e0b, 0 0 30px #f59e0b; border: 2px solid #fff;"></div>
        <svg width="40" height="40" viewBox="0 0 40 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
          <path d="M20 38c-1-2-12-16-12-23a12 12 0 1 1 24 0c0 7-11 21-12 23z" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="2"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -38],
  })
}

// Auto-center map component whenever destination changes
function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function TripMapClient({ destination }) {
  const [coords, setCoords] = useState([51.505, -0.09])
  const [loading, setLoading] = useState(false)
  const [displayDest, setDisplayDest] = useState(destination || "Searching...")
  const [weather, setWeather] = useState(null)
  const [activeTheme, setActiveTheme] = useState("dark")
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const goldIcon = useMemo(() => createGoldIcon(displayDest), [displayDest])

  useEffect(() => {
    if (!destination || destination === "Custom Trip") return
    setDisplayDest(destination)
    setWeather(null)
    const fetchAll = async () => {
      setLoading(true)
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`)
        const geoData = await geoRes.json()
        if (geoData && geoData.length > 0) {
          const lat = parseFloat(geoData[0].lat)
          const lon = parseFloat(geoData[0].lon)
          setCoords([lat, lon])
          // Fetch weather from Open-Meteo (free, no API key)
          const wxRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&timezone=auto`
          )
          const wxData = await wxRes.json()
          if (wxData?.current) {
            setWeather({
              temp: Math.round(wxData.current.temperature_2m),
              wind: Math.round(wxData.current.windspeed_10m),
              humidity: wxData.current.relative_humidity_2m,
              ...getWeatherInfo(wxData.current.weathercode),
            })
          }
        }
      } catch (e) {
        console.error("Map/Weather fetch failed", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [destination])

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
      
      {/* Destination Info Overlay */}
      <div style={{
        position: "absolute", top: 20, left: 20, zIndex: 1000,
        background: "rgba(15, 23, 42, 0.82)", backdropFilter: "blur(14px)",
        border: "1px solid var(--border-gold)", borderRadius: 16,
        padding: "12px 20px", display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "fadeUp 0.6s ease"
      }}>
        <div style={{ fontSize: 22 }}>📍</div>
        <div>
          <h3 style={{ fontSize: 17, color: "var(--white)", fontWeight: 700, margin: 0 }}>{displayDest}</h3>
          <p style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>Exploration View</p>
        </div>
      </div>

      {/* Theme Toggle Button */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <button 
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          style={{
            width: 44, height: 44, borderRadius: 12, background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)",
            border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "var(--gold)", cursor: "pointer", transition: "all 0.2s ease"
          }}>
          🗺️
        </button>

        {showThemeMenu && (
          <div className="glass" style={{
            padding: 8, borderRadius: 14, minWidth: 140, display: "flex", flexDirection: "column", gap: 4,
            animation: "fadeUp 0.3s ease", border: "1px solid var(--border-gold)"
          }}>
            {Object.entries(MAP_THEMES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => { setActiveTheme(key); setShowThemeMenu(false) }}
                style={{
                  padding: "8px 12px", borderRadius: 8, textAlign: "left", fontSize: 12, fontWeight: activeTheme === key ? 600 : 400,
                  background: activeTheme === key ? "var(--gold)" : "transparent",
                  color: activeTheme === key ? "#0a0f1e" : "var(--white)",
                  border: "none", cursor: "pointer", transition: "all 0.2s"
                }}>
                {config.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Weather Overlay */}
      {weather && (
        <div style={{
          position: "absolute", bottom: 60, left: 20, zIndex: 1000,
          background: "rgba(15, 23, 42, 0.82)", backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
          padding: "12px 18px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.5s ease",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ fontSize: 28 }}>{weather.icon}</div>
          <div>
            <p style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Live Weather</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--white)", lineHeight: 1 }}>{weather.temp}°C</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{weather.label}</p>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 14, display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>💨 {weather.wind} km/h</p>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>💧 {weather.humidity}%</p>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: "absolute", zIndex: 1001, inset: 0, background: "rgba(2,6,23,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, border: "2px solid rgba(245,158,11,0.2)", borderTop: "2px solid var(--gold)", borderRadius: "50%", animation: "spin-compass 1s linear infinite" }} />
        </div>
      )}

      <MapContainer center={coords} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl={true}>
        <TileLayer
          attribution={MAP_THEMES[activeTheme].attr}
          url={MAP_THEMES[activeTheme].url}
        />
        <Marker position={coords} icon={goldIcon}>
          <Popup>
            <div style={{ textAlign: "center" }}>
              <strong style={{ display: "block", marginBottom: 4 }}>{displayDest}</strong>
              {weather && <span style={{ fontSize: 12 }}>{weather.icon} {weather.temp}°C · {weather.label}</span>}
            </div>
          </Popup>
        </Marker>
        <MapUpdater center={coords} />
      </MapContainer>
    </div>
  )
}
