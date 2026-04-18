from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config.supabase import get_supabase
from db.user_db import get_user_by_auth_id

# ============================================
# AUTH MIDDLEWARE
# Attach to any route that needs login:
# async def my_route(user=Depends(get_current_user)):
# ============================================

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        supabase = get_supabase()
        auth_response = supabase.auth.get_user(token)

        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token. Please login again."
            )

        user = get_user_by_auth_id(auth_response.user.id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found."
            )

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials."
        )


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))
):
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None