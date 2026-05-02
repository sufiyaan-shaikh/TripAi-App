from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config.supabase import get_supabase
from db.user_db import get_user_by_auth_id

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

            from db.user_db import create_user
            user = create_user(
                auth_id=auth_response.user.id,
                email=auth_response.user.email,
                full_name=auth_response.user.email.split("@")[0]
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile could not be created."
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