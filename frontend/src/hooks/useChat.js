"use client"
import { useState, useCallback, useEffect } from "react"
import { getToken } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

let supabaseClient = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function useChat(roomId = null) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm TripAI 👋 Tell me where you want to go and I'll plan everything for you.\n\nTry: *\"Plan a 5 day trip to London\"*"
    }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/multiplayer/room/${roomId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          setMessages([
            { role: "assistant", content: "Hi! I'm TripAI 👋 Tell me where you want to go and I'll plan everything for you.\n\nTry: *\"Plan a 5 day trip to London\"*" },
            ...data.messages.map(m => ({ role: m.role, content: m.content }))
          ])
        }
      } catch (err) {
        console.error("Failed to load multiplayer history", err)
      }
    }
    fetchRoom()
  }, [roomId])

  useEffect(() => {
    if (!roomId || !supabaseClient) return;

    const channel = supabaseClient
      .channel(`room:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
        const newMsg = payload.new;
        setMessages(prev => {

          const isDuplicate = prev.some(m => m.content === newMsg.content && m.role === newMsg.role)
          if (isDuplicate) return prev;
          return [...prev, { role: newMsg.role, content: newMsg.content }]
        })
      })
      .subscribe()

    return () => { supabaseClient.removeChannel(channel) }
  }, [roomId])

  const sendMessage = useCallback(async (userInput) => {
    if (!userInput.trim() || loading) return

    const userMessage = { role: "user", content: userInput }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)
    setError("")

    try {
      const payload = { messages: updatedMessages }
      if (roomId) payload.room_id = roomId;

      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "AI service failed")

      if (!roomId) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
      }

    } catch (err) {
      setError("Something went wrong. Please try again.")
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }, [messages, loading, roomId])

  const clearChat = useCallback(() => {
    setMessages([
      { role: "assistant", content: "Hi! I'm TripAI 👋 Tell me where you want to go and I'll plan everything for you.\n\nTry: *\"Plan a 5 day trip to London\"*" }
    ])
    setError("")
  }, [])

  return { messages, loading, error, sendMessage, clearChat }
}