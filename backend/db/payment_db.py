

from config.supabase import get_supabase

def save_payment(
    user_id: str,
    trip_id: str,
    stripe_payment_intent_id: str,
    stripe_client_secret: str,
    amount: float,
    currency: str,
    flight_cost: float,
    hotel_cost: float,
    tax_amount: float,
    platform_fee: float,
):
    supabase = get_supabase()
    data = {
        "user_id":                      user_id,
        "trip_id":                      trip_id,
        "stripe_payment_intent_id":     stripe_payment_intent_id,
        "stripe_client_secret":         stripe_client_secret,
        "amount":                       amount,
        "currency":                     currency,
        "flight_cost":                  flight_cost,
        "hotel_cost":                   hotel_cost,
        "tax_amount":                   tax_amount,
        "platform_fee":                 platform_fee,
        "status":                       "pending",
    }
    result = supabase.table("payments").insert(data).execute()
    return result.data[0] if result.data else None

def update_payment_status(
    stripe_payment_intent_id: str,
    status: str,
    stripe_charge_id: str = None,
):
    supabase = get_supabase()
    update_data = {"status": status}
    if stripe_charge_id:
        update_data["stripe_charge_id"] = stripe_charge_id

    result = (
        supabase.table("payments")
        .update(update_data)
        .eq("stripe_payment_intent_id", stripe_payment_intent_id)
        .execute()
    )
    return result.data[0] if result.data else None

def save_payment_method(
    user_id: str,
    stripe_payment_method_id: str,
    card_last4: str,
    card_network: str,
    card_expiry: str,
    is_default: bool = True,
):
    supabase = get_supabase()

    if is_default:
        supabase.table("payment_methods").update(
            {"is_default": False}
        ).eq("user_id", user_id).execute()

    data = {
        "user_id":                      user_id,
        "stripe_payment_method_id":     stripe_payment_method_id,
        "card_last4":                   card_last4,
        "card_network":                 card_network,
        "card_expiry":                  card_expiry,
        "is_default":                   is_default,
        "is_active":                    True,
    }
    result = supabase.table("payment_methods").insert(data).execute()
    return result.data[0] if result.data else None

def get_payment_methods(user_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("payment_methods")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("is_default", desc=True)
        .execute()
    )
    return result.data or []

def get_payment_by_intent(stripe_payment_intent_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("payments")
        .select("*")
        .eq("stripe_payment_intent_id", stripe_payment_intent_id)
        .single()
        .execute()
    )
    return result.data

def get_payment_history(user_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("payments")
        .select("*, trips(destination, start_date, end_date)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []