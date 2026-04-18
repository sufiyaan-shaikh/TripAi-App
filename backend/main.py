# ============================================
# TRIPAI — App Entry Point
# backend/main.py
# ============================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routes.auth_routes    import router as auth_router
from routes.ai_routes      import router as ai_router
from routes.trip_routes    import router as trip_router
from routes.payment_routes import router as payment_router
from routes.user_routes    import router as user_router
from routes.pdf_routes     import router as pdf_router
from routes.multiplayer_routes import router as multiplayer_router
from routes.wishlist_routes    import router as wishlist_router

app = FastAPI(
    title="TripAI API",
    description="AI-powered travel planning backend",
    version="1.0.0"
)

# CORS Policy - Allow everything for smoother initial cloud setup, 
# or restrict to specific production domains if FRONTEND_URL is set.
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
env_frontend = os.getenv("FRONTEND_URL")
if env_frontend:
    allowed_origins.append(env_frontend)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if env_frontend else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(ai_router,      prefix="/api/ai",      tags=["AI"])
app.include_router(trip_router,    prefix="/api/trips",   tags=["Trips"])
app.include_router(payment_router, prefix="/api/payment", tags=["Payments"])
app.include_router(user_router,    prefix="/api/user",    tags=["Users"])
app.include_router(pdf_router,     prefix="/api/pdf",     tags=["PDF"])
app.include_router(multiplayer_router, prefix="/api/multiplayer", tags=["Multiplayer"])
app.include_router(wishlist_router,    prefix="/api/wishlist",    tags=["Wishlist"])

@app.get("/")
def health_check():
    return {"status": "TripAI backend is running"}