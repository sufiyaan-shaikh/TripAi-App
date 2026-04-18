from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from utils.auth_middleware import get_current_user
from config.supabase import get_supabase_admin

router = APIRouter()


class WishlistItem(BaseModel):
    destination: str
    country: str = ""
    notes: str = ""


@router.get("/")
def get_wishlist(user=Depends(get_current_user)):
    supabase = get_supabase_admin()
    try:
        res = supabase.table("wishlist").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
        return {"items": res.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def add_to_wishlist(item: WishlistItem, user=Depends(get_current_user)):
    supabase = get_supabase_admin()
    try:
        res = supabase.table("wishlist").insert({
            "user_id": user["id"],
            "destination": item.destination,
            "country": item.country,
            "notes": item.notes,
        }).execute()
        return {"item": res.data[0] if res.data else {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{item_id}")
def remove_from_wishlist(item_id: str, user=Depends(get_current_user)):
    supabase = get_supabase_admin()
    try:
        supabase.table("wishlist").delete().eq("id", item_id).eq("user_id", user["id"]).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
