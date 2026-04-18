from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from config.supabase import get_supabase_admin
from utils.auth_middleware import get_current_user

router = APIRouter()

class MessagePayload(BaseModel):
    role: str
    content: str

@router.post("/room")
async def create_room(user=Depends(get_current_user)):
    supabase = get_supabase_admin()
    res = supabase.table("chat_rooms").insert({}).execute()
    return {"room_id": res.data[0]["id"]} if res.data else None

@router.get("/room/{room_id}")
async def get_room(room_id: str, user=Depends(get_current_user)):
    supabase = get_supabase_admin()
    res = supabase.table("chat_messages").select("*").eq("room_id", room_id).order("created_at", desc=False).execute()
    return {"messages": res.data}

@router.post("/room/{room_id}")
async def post_message(room_id: str, payload: MessagePayload, user=Depends(get_current_user)):
    supabase = get_supabase_admin()
    supabase.table("chat_messages").insert({
        "room_id": room_id,
        "role": payload.role,
        "content": payload.content
    }).execute()
    return {"success": True}
