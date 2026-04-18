"use client"
import ChatPage from "../page"
import { use } from "react"

export default function MultiplayerChatPage({ params }) {
  // In Next 15, params is often a Promise unwrappable with `use`
  const { roomId } = use(params)
  return <ChatPage roomId={roomId} />
}
