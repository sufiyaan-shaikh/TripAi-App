"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat"
import { logoutUser } from "@/lib/auth"

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const { messages, loading, error, sendMessage, clearChat } = useChat()
  const [input, setInput]   = useState("")
  const bottomRef           = useRef(null)
  const inputRef            = useRef(null)
  const router              = useRouter()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const text = input
    setInput("")
    await sendMessage(text)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLogout = async () => {
    await logoutUser()
    router.push("/auth/login")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold">
          Trip<span className="text-blue-400">AI</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Preferences
          </button>
          <button
            onClick={clearChat}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            New Chat
          </button>
          <span className="text-sm text-gray-600">|</span>
          <span className="text-sm text-gray-500">{user?.full_name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mr-3 mt-1">
                  AI
                </div>
              )}

              {}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}
              >
                {msg.content}
              </div>

              {}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0 ml-3 mt-1">
                  {user?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          ))}

          {}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mr-3 mt-1">
                AI
              </div>
              <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {}
          {error && (
            <div className="flex justify-center">
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
                {error}
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {}
      <div className="border-t border-gray-800 px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Plan a 5 day trip to London..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
                       placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors
                       resize-none disabled:opacity-50 max-h-40 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
            onInput={e => {
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
                       text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors shrink-0"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}