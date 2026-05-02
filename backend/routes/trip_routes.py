from fastapi import APIRouter, Depends, HTTPException
from utils.auth_middleware import get_current_user
from db.trip_db import save_trip as db_save_trip, get_user_trips
from config.supabase import get_supabase_admin

router = APIRouter()

@router.get("/history")
async def get_trip_history(user=Depends(get_current_user)):
    try:
        trips = get_user_trips(user["id"])
        return {"trips": trips}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save")
async def save_trip(payload: dict, user=Depends(get_current_user)):
    try:
        saved = db_save_trip(user["id"], payload)
        return {"message": "Trip saved", "trip": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_trip_stats(user=Depends(get_current_user)):
    try:
        trips = get_user_trips(user["id"])
        planned = len(trips)

        PAID_STATUSES = {"booked", "paid", "completed", "succeeded", "confirmed"}
        booked = len([t for t in trips if t.get("status", "").lower() in PAID_STATUSES])

        supabase = get_supabase_admin()
        payments_res = supabase.table("payments") \
            .select("amount") \
            .eq("user_id", user["id"]) \
            .in_("status", ["succeeded", "completed", "paid"]) \
            .execute()

        total_spent = int(sum(float(p.get("amount", 0)) for p in (payments_res.data or [])))

        if total_spent == 0 and booked > 0:
            total_spent = int(sum(
                float(t.get("total_cost", 0))
                for t in trips
                if t.get("status", "").lower() in PAID_STATUSES
            ))

        destinations = {t.get("destination", "").split(",")[-1].strip() for t in trips if t.get("status", "").lower() in PAID_STATUSES}
        countries_count = len([d for d in destinations if d])

        wishlist_res = supabase.table("wishlist").select("id", count="exact").eq("user_id", user["id"]).execute()
        places_saved = wishlist_res.count or 0

        from datetime import date
        today = date.today().isoformat()
        upcoming = len([t for t in trips if t.get("start_date", "") > today])

        return {
            "trips_planned": planned,
            "trips_booked": booked,
            "total_spent": total_spent,
            "countries_visited": countries_count,
            "places_saved": places_saved,
            "upcoming_trips": upcoming
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

