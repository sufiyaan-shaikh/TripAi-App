from config.supabase import get_supabase_admin

def save_trip(user_id: str, trip_data: dict) -> dict:
    supabase = get_supabase_admin()
    response = supabase.table("trips").insert({
        "user_id":       user_id,
        "destination":   trip_data["destination"],
        "origin":        trip_data["origin"],
        "start_date":    trip_data["start_date"],
        "end_date":      trip_data["end_date"],
        "duration_days": trip_data["duration_days"],
        "num_travelers": trip_data.get("num_travelers", 1),
        "total_cost":    trip_data.get("total_cost", 0),
        "currency":      trip_data.get("currency", "INR"),
        "status":        "planned",
        "ai_plan":       trip_data.get("ai_plan", {})
    }).execute()
    return response.data[0] if response.data else None

def get_trip_by_id(trip_id: str) -> dict:
    supabase = get_supabase_admin()
    trip = supabase.table("trips").select("*").eq("id", trip_id).single().execute()
    if not trip.data:
        return None
    flights   = supabase.table("trip_flights").select("*").eq("trip_id", trip_id).execute()
    hotels    = supabase.table("trip_hotels").select("*").eq("trip_id", trip_id).execute()
    itinerary = supabase.table("trip_itinerary").select("*").eq("trip_id", trip_id).order("day_number").execute()
    return {
        **trip.data,
        "flight":    flights.data[0] if flights.data else None,
        "hotel":     hotels.data[0] if hotels.data else None,
        "itinerary": itinerary.data
    }

def get_user_trips(user_id: str) -> list:
    supabase = get_supabase_admin()
    response = supabase.table("trips")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()
    return response.data

def update_trip_status(trip_id: str, status: str) -> dict:
    supabase = get_supabase_admin()
    response = supabase.table("trips")\
        .update({"status": status})\
        .eq("id", trip_id)\
        .execute()
    return response.data[0] if response.data else None