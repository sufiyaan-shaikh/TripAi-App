import random
import uuid

async def search_hotels(city_code: str, checkin: str, checkout: str, star_rating: int = 4):
    # Mock data as requested
    base_price = random.randint(2000, 10000)
    return [
        {
            "hotelId": f"dummy_hotel_{uuid.uuid4().hex[:6]}",
            "name": f"The Grand {city_code} Resort",
            "rating": star_rating,
            "address": {"cityName": city_code},
            "price": {"total": f"{base_price:.2f}", "currency": "INR"}
        },
        {
            "hotelId": f"dummy_hotel_{uuid.uuid4().hex[:6]}",
            "name": f"{city_code} City Center Hotel",
            "rating": star_rating - 1,
            "address": {"cityName": city_code},
            "price": {"total": f"{base_price - 1000:.2f}", "currency": "INR"}
        }
    ]

async def book_hotel(hotel_id: str, room_id: str, guest_info: dict):
    # Mock successful booking
    return {"status": "success", "booking_id": f"MOCK-HOTEL-{uuid.uuid4().hex[:8].upper()}"}