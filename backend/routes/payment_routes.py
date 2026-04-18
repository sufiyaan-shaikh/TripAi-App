# ============================================
# TRIPAI — Payment Routes
# backend/routes/payment_routes.py
# ============================================

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel
from utils.auth_middleware import get_current_user
from services.payment_service import (
    create_payment_intent,
    confirm_payment,
    save_card,
    handle_webhook
)
from db.payment_db import get_payment_methods, get_payment_history
from config.stripe import get_publishable_key

router = APIRouter()


# ============================================
# REQUEST MODELS
# ============================================

class CreateIntentRequest(BaseModel):
    trip_id:        str
    amount_inr:     float
    flight_cost:    float = 0
    hotel_cost:     float = 0


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str


class SaveCardRequest(BaseModel):
    payment_method_id:  str
    card_last4:         str
    card_network:       str
    card_expiry:        str
    set_as_default:     bool = True


# ============================================
# GET STRIPE PUBLISHABLE KEY
# GET /api/payment/config
# ============================================

@router.get("/config")
async def get_config():
    return {"publishable_key": get_publishable_key()}


# ============================================
# CREATE PAYMENT INTENT
# POST /api/payment/create-intent
# ============================================

@router.post("/create-intent")
async def create_intent(
    payload: CreateIntentRequest,
    user=Depends(get_current_user)
):
    try:
        result = await create_payment_intent(
            trip_id=payload.trip_id,
            user_id=user["id"],
            amount_inr=payload.amount_inr,
            flight_cost=payload.flight_cost,
            hotel_cost=payload.hotel_cost,
        )
        return result
    except Exception as e:
        print(f"PAYMENT ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# CONFIRM PAYMENT
# POST /api/payment/confirm
# ============================================

@router.post("/confirm")
async def confirm(
    payload: ConfirmPaymentRequest,
    user=Depends(get_current_user)
):
    try:
        result = await confirm_payment(
            payment_intent_id=payload.payment_intent_id,
            user_id=user["id"]
        )
        return result
    except Exception as e:
        print(f"CONFIRM ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# SAVE CARD TOKEN
# POST /api/payment/save-card
# ============================================

@router.post("/save-card")
async def add_card(
    payload: SaveCardRequest,
    user=Depends(get_current_user)
):
    try:
        result = await save_card(
            user_id=user["id"],
            payment_method_id=payload.payment_method_id,
            card_last4=payload.card_last4,
            card_network=payload.card_network,
            card_expiry=payload.card_expiry,
            set_as_default=payload.set_as_default,
        )
        return result
    except Exception as e:
        print(f"SAVE CARD ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# GET SAVED CARDS
# GET /api/payment/cards
# ============================================

@router.get("/cards")
async def get_cards(user=Depends(get_current_user)):
    try:
        cards = get_payment_methods(user["id"])
        return {"cards": cards}
    except Exception as e:
        print(f"GET CARDS ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# GET PAYMENT HISTORY
# GET /api/payment/history
# ============================================

@router.get("/history")
async def payment_history(user=Depends(get_current_user)):
    try:
        history = get_payment_history(user["id"])
        return {"payments": history}
    except Exception as e:
        print(f"HISTORY ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# STRIPE WEBHOOK
# POST /api/payment/webhook
# ============================================

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None)
):
    payload = await request.body()

    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")

    try:
        result = await handle_webhook(
            payload=payload,
            sig_header=stripe_signature
        )
        return result
    except Exception as e:
        print(f"WEBHOOK ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))