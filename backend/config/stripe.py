# ============================================
# TRIPAI — Stripe Configuration
# backend/config/stripe.py
# ============================================

import os
import stripe
from dotenv import load_dotenv

load_dotenv()

# Load keys from environment
STRIPE_SECRET_KEY       = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY  = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_WEBHOOK_SECRET   = os.getenv("STRIPE_WEBHOOK_SECRET")

# Validate on startup — crashes early if keys are missing
if not STRIPE_SECRET_KEY:
    raise ValueError("STRIPE_SECRET_KEY is missing from .env")

if not STRIPE_PUBLISHABLE_KEY:
    raise ValueError("STRIPE_PUBLISHABLE_KEY is missing from .env")

# Set the secret key globally on the Stripe library
# Every stripe.* call after this will use this key automatically
stripe.api_key = STRIPE_SECRET_KEY


def get_stripe():
    """
    Returns the configured stripe module.
    Import and call this wherever you need to make Stripe API calls.
    
    Usage:
        from config.stripe import get_stripe
        stripe = get_stripe()
        intent = stripe.PaymentIntent.create(...)
    """
    return stripe


def get_publishable_key():
    """
    Returns the publishable key.
    Used by the frontend config endpoint so the frontend
    never has to hardcode the key.
    """
    return STRIPE_PUBLISHABLE_KEY