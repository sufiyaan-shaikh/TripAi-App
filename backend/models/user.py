from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    nationality: Optional[str] = None

class TravelPreferences(BaseModel):
    preferred_flight_class: str = "Economy"      
    preferred_hotel_stars: int = 4               
    preferred_transport: str = "Flight"          
    dietary_requirements: Optional[str] = None
    currency: str = "INR"
