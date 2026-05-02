from pydantic import BaseModel
from typing import Optional

class PaymentToken(BaseModel):
    user_id: str
    razorpay_token: str          
    card_last4: str              
    card_network: str            

class PaymentRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    trip_id: str
    amount: float
    currency: str = "INR"
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    status: str = "pending"      
