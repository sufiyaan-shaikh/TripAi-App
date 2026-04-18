from pydantic import BaseModel
from typing import Optional

class PaymentToken(BaseModel):
    user_id: str
    razorpay_token: str          # Token only — NEVER raw card number
    card_last4: str              # Last 4 digits for display only
    card_network: str            # Visa / Mastercard / Rupay

class PaymentRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    trip_id: str
    amount: float
    currency: str = "INR"
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    status: str = "pending"      # pending / success / failed
