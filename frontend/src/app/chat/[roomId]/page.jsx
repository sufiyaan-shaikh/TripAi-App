"use client"
import ChatPage from "../page"
import { use } from "react"

export default function MultiplayerChatPage({ params }) {

  const { roomId } = use(params)
  return <ChatPage roomId={roomId} />
}
