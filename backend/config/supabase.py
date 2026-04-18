import os
from supabase import create_client, Client

SUPABASE_URL         = os.getenv("SUPABASE_URL")
SUPABASE_KEY         = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def get_supabase() -> Client:
    """Anon client — used for auth verification"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_admin() -> Client:
    """Service role client — used for DB operations from backend"""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)