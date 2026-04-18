from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from config.supabase import get_supabase
from db.user_db import create_user, get_user_by_auth_id, get_or_create_preferences
from utils.auth_middleware import get_current_user

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str


# --- REGISTER ---
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    supabase = get_supabase()
    try:
        auth_response = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed.")

        user = create_user(
            auth_id=auth_response.user.id,
            email=payload.email,
            full_name=payload.full_name
        )

        if not user:
            raise HTTPException(status_code=500, detail="Failed to create user profile.")

        get_or_create_preferences(user["id"])

        return {
            "message": "Account created successfully.",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"]
            },
            "access_token": auth_response.session.access_token if auth_response.session else None,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        if "already registered" in str(e).lower() or "already exists" in str(e).lower():
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        raise HTTPException(status_code=500, detail=str(e))


# --- LOGIN ---
@router.post("/login")
async def login(payload: LoginRequest):
    supabase = get_supabase()
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })

        if not auth_response.user or not auth_response.session:
            raise HTTPException(status_code=401, detail="Incorrect email or password.")

        # Try to get user record; create one if it doesn't exist (edge case)
        user = get_user_by_auth_id(auth_response.user.id)
        if not user:
            user = create_user(
                auth_id=auth_response.user.id,
                email=payload.email,
                full_name=payload.email.split("@")[0]
            )

        return {
            "message": "Login successful.",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"]
            },
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")


# --- LOGOUT ---
@router.post("/logout")
async def logout(user=Depends(get_current_user)):
    supabase = get_supabase()
    supabase.auth.sign_out()
    return {"message": "Logged out successfully."}


# --- GET CURRENT USER ---
@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "nationality": user.get("nationality"),
        "phone": user.get("phone"),
    }


# --- REFRESH TOKEN ---
@router.post("/refresh")
async def refresh_token(payload: RefreshRequest):
    supabase = get_supabase()
    try:
        response = supabase.auth.refresh_session(payload.refresh_token)
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer"
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")