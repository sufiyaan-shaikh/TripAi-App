import random
import uuid

async def search_flights(origin: str, destination: str, date: str, cabin_class: str = "ECONOMY"):

    base_price = random.randint(3000, 15000)
    return [
        {
            "id": f"dummy_flight_{uuid.uuid4().hex[:6]}",
            "price": {"total": f"{base_price:.2f}", "currency": "INR"},
            "itineraries": [{"segments": [{"departure": {"iataCode": origin}, "arrival": {"iataCode": destination}}]}]
        },
         {
            "id": f"dummy_flight_{uuid.uuid4().hex[:6]}",
            "price": {"total": f"{base_price + 2000:.2f}", "currency": "INR"},
            "itineraries": [{"segments": [{"departure": {"iataCode": origin}, "arrival": {"iataCode": destination}}]}]
        }
    ]

async def book_flight(flight_offer: dict, traveler_info: dict):

    return {"status": "success", "booking_id": f"MOCK-FLIGHT-{uuid.uuid4().hex[:8].upper()}"}