from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class FlightDetails(BaseModel):
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure: str
    arrival: str
    cabin_class: str
    price: float

class HotelDetails(BaseModel):
    name: str
    stars: int
    location: str
    checkin: str
    checkout: str
    room_type: str
    price_per_night: float
    total_price: float

class DayPlan(BaseModel):
    day: int
    date: str
    places: List[str]
    description: str

class TripPlan(BaseModel):
    id: Optional[str] = None
    user_id: str
    destination: str
    duration_days: int
    total_cost: float
    flight: Optional[FlightDetails] = None
    hotel: Optional[HotelDetails] = None
    itinerary: List[DayPlan] = []
    status: str = "planned"   
