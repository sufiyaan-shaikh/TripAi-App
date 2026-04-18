from config.supabase import get_supabase_admin

def create_user(auth_id: str, email: str, full_name: str):
    supabase = get_supabase_admin()
    response = supabase.table("users").insert({
        "auth_id": auth_id,
        "email": email,
        "full_name": full_name
    }).execute()
    return response.data[0] if response.data else None


def get_user_by_auth_id(auth_id: str):
    supabase = get_supabase_admin()
    response = supabase.table("users")\
        .select("*")\
        .eq("auth_id", auth_id)\
        .single()\
        .execute()
    return response.data


def update_user(user_id: str, updates: dict):
    supabase = get_supabase_admin()
    response = supabase.table("users")\
        .update(updates)\
        .eq("id", user_id)\
        .execute()
    return response.data[0] if response.data else None


def get_or_create_preferences(user_id: str):
    supabase = get_supabase_admin()
    response = supabase.table("preferences")\
        .select("*")\
        .eq("user_id", user_id)\
        .execute()

    if response.data:
        return response.data[0]

    new_prefs = supabase.table("preferences").insert({
        "user_id": user_id
    }).execute()
    return new_prefs.data[0] if new_prefs.data else None


def update_preferences(user_id: str, updates: dict):
    supabase = get_supabase_admin()
    response = supabase.table("preferences")\
        .update(updates)\
        .eq("user_id", user_id)\
        .execute()
    return response.data[0] if response.data else None