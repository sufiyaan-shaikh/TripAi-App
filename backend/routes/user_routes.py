from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.auth_middleware import get_current_user
from db.user_db import update_user, get_or_create_preferences, update_preferences

router = APIRouter()


# ============================================
# REQUEST MODELS
# ============================================

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    nationality: Optional[str] = None
    phone: Optional[str] = None


class UpdatePreferencesRequest(BaseModel):
    preferred_flight_class: Optional[str] = None
    preferred_airline: Optional[str] = None
    preferred_hotel_stars: Optional[int] = None
    preferred_hotel_type: Optional[str] = None
    preferred_transport: Optional[str] = None
    dietary_requirements: Optional[str] = None
    preferred_currency: Optional[str] = None
    budget_range: Optional[str] = None


# ============================================
# GET PROFILE
# GET /api/user/profile
# ============================================

@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    """Returns full user profile + preferences in one call"""
    prefs = get_or_create_preferences(user["id"])
    return {
        "profile": {
            "id":          user["id"],
            "email":       user["email"],
            "full_name":   user["full_name"],
            "nationality": user.get("nationality"),
            "phone":       user.get("phone"),
        },
        "preferences": prefs
    }


# ============================================
# UPDATE PROFILE
# PUT /api/user/profile
# ============================================

@router.put("/profile")
async def update_profile(
    payload: UpdateProfileRequest,
    user=Depends(get_current_user)
):
    """Update basic profile info"""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")

    updated = update_user(user["id"], updates)
    return {"message": "Profile updated.", "profile": updated}


# ============================================
# UPDATE PREFERENCES
# PUT /api/user/preferences
# ============================================

@router.put("/preferences")
async def update_user_preferences(
    payload: UpdatePreferencesRequest,
    user=Depends(get_current_user)
):
    """Update travel preferences"""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No preferences to update.")

    updated = update_preferences(user["id"], updates)
    return {"message": "Preferences saved.", "preferences": updated}


# ============================================
# GET PREFERENCES ONLY
# GET /api/user/preferences
# ============================================

@router.get("/preferences")
async def get_preferences(user=Depends(get_current_user)):
    """Get just the preferences — used by AI service"""
    prefs = get_or_create_preferences(user["id"])
    return prefs