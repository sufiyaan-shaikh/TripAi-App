"use client"
import React, { createContext, useContext, useState, useEffect } from "react"

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed")
    if (saved === "true") setIsCollapsed(true)
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem("sidebar_collapsed", String(next))
      return next
    })
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
