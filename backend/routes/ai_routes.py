from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from utils.auth_middleware import get_current_user
from config.supabase import get_supabase_admin
from db.user_db import get_or_create_preferences
from services.ai_service import chat
from services.prompts import build_trip_planning_prompt, build_general_prompt

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    room_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    payload: ChatRequest,
    user=Depends(get_current_user)
):
    try:
        preferences = get_or_create_preferences(user["id"])
        if preferences:
            system_prompt = build_trip_planning_prompt(preferences)
        else:
            system_prompt = build_general_prompt()

        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in payload.messages
        ]

        reply = await chat(messages, system_prompt)

        if payload.room_id:
            supabase = get_supabase_admin()
            try:
                last_user_msg = messages[-1] if messages else None
                if last_user_msg and last_user_msg["role"] == "user":
                    supabase.table("chat_messages").insert({
                        "room_id": payload.room_id,
                        "role": "user",
                        "content": last_user_msg["content"]
                    }).execute()
                
                supabase.table("chat_messages").insert({
                    "room_id": payload.room_id,
                    "role": "assistant",
                    "content": reply
                }).execute()
            except Exception as e:
                print("Multiplayer sync failed:", e)

        return {"reply": reply}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")