import { 
  LayoutDashboard, 
  Map, 
  MapPin, 
  Calendar, 
  Wallet, 
  User, 
  Settings, 
  LogOut,
  Menu,
  ChevronLeft
} from "lucide-react"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()

  const navItems = [
    { label: "Dashboard",   path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Trips",       path: "/trips",     icon: <Map size={20} /> },
    { label: "Destinations",path: "/wishlist",  icon: <MapPin size={20} /> },
    { label: "Itinerary",   path: "/chat",      icon: <Calendar size={20} /> },
    { label: "Budget",      path: "/dashboard", icon: <Wallet size={20} /> }, 
    { label: "Profile",     path: "/profile",   icon: <User size={20} /> },
    { label: "Settings",    path: "/profile",   icon: <Settings size={20} /> },
  ]

  const handleLogout = async () => {
    await logoutUser()
    router.push("/auth/login")
  }

  const sidebarWidth = isCollapsed ? 80 : 260

  return (
    <aside style={{
      width: sidebarWidth,
      minHeight: "100vh",
      background: "rgba(2, 6, 23, 0.7)",
      backdropFilter: "blur(40px) saturate(180%)",
      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      transition: "width 0.3s ease",
      left: 0,
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ padding: isCollapsed ? "32px 0" : "32px 24px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
        {isCollapsed ? (
          <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--white)" }}>T</span>
        ) : (
          <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--white)" }}>
            Trip<span className="gold-text">AI</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              title={item.label}
              style={{
                display: "flex", alignItems: "center", gap: 12, justifyContent: isCollapsed ? "center" : "flex-start",
                width: "100%", padding: "12px 16px",
                borderRadius: 12, border: "none", cursor: "pointer",
                background: isActive ? "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))" : "transparent",
                color: isActive ? "var(--gold)" : "var(--muted)",
                fontFamily: "var(--font-body)", fontSize: 15, fontWeight: isActive ? 600 : 500,
                textAlign: "left", transition: "all 0.2s ease"
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--white)" }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--muted)" }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Toggle Button */}
      <div style={{ padding: "0 16px 16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <button
          onClick={toggleSidebar}
          style={{
            width: "100%", padding: "10px", borderRadius: 8, cursor: "pointer",
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
            color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "▶" : "◀ Collapse"}
        </button>
      </div>

      {/* User / Footer */}
      <div style={{ padding: isCollapsed ? "16px 8px" : "24px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div className="glass" style={{
          borderRadius: 16, padding: isCollapsed ? "12px 0" : "16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              fontSize: 14, fontWeight: 600, color: "var(--gold)", cursor: "pointer"
            }} title={user?.email}>
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <div style={{ overflow: "hidden", flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.full_name || "User"}
                </p>
                <p style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email || "user@tripai.com"}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={handleLogout} className="btn-ghost" style={{ width: "100%", padding: "8px", borderRadius: 8, fontSize: 13 }}>
              Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
