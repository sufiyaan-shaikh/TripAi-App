

from config.stripe import get_stripe, STRIPE_WEBHOOK_SECRET
from db.payment_db import (
    save_payment,
    update_payment_status,
    save_payment_method
)
from db.trip_db import update_trip_status

stripe = get_stripe()

async def create_payment_intent(
    trip_id: str,
    user_id: str,
    amount_inr: float,
    flight_cost: float = 0,
    hotel_cost: float = 0,
    currency: str = "usd"
):
    try:
        tax_amount_inr   = round(amount_inr * 0.05, 2)
        platform_fee_inr = round(amount_inr * 0.02, 2)
        total_inr        = amount_inr + tax_amount_inr + platform_fee_inr
        total_usd_cents  = int(round(total_inr / 83, 2) * 100)

        intent = stripe.PaymentIntent.create(
            amount=total_usd_cents,
            currency=currency,
            metadata={
                "trip_id":          trip_id,
                "user_id":          user_id,
                "amount_inr":       str(amount_inr),
                "flight_cost_inr":  str(flight_cost),
                "hotel_cost_inr":   str(hotel_cost),
                "tax_inr":          str(tax_amount_inr),
                "platform_fee_inr": str(platform_fee_inr),
                "total_inr":        str(total_inr),
            },
            automatic_payment_methods={"enabled": True},
        )

        try:
            save_payment(
                user_id=user_id,
                trip_id=trip_id,
                stripe_payment_intent_id=intent.id,
                stripe_client_secret=intent.client_secret,
                amount=total_inr,
                currency="inr",
                flight_cost=flight_cost,
                hotel_cost=hotel_cost,
                tax_amount=tax_amount_inr,
                platform_fee=platform_fee_inr,
            )
        except Exception as db_error:
            print(f"DB save warning (non-critical): {db_error}")

        return {
            "client_secret":     intent.client_secret,
            "payment_intent_id": intent.id,
            "amount_inr":        amount_inr,
            "flight_cost":       flight_cost,
            "hotel_cost":        hotel_cost,
            "tax_inr":           tax_amount_inr,
            "platform_fee_inr":  platform_fee_inr,
            "total_inr":         total_inr,
            "currency_display":  "INR",
        }

    except Exception as e:
        raise Exception(f"Stripe error: {str(e)}")

async def confirm_payment(
    payment_intent_id: str,
    user_id: str
):
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if intent.status == "succeeded":
            stripe_charge_id = intent.latest_charge if intent.latest_charge else None

            try:
                update_payment_status(
                    stripe_payment_intent_id=payment_intent_id,
                    status="success",
                    stripe_charge_id=stripe_charge_id,
                )
                trip_id = intent.metadata.get("trip_id")
                if trip_id:
                    update_trip_status(trip_id=trip_id, status="confirmed")
            except Exception as db_error:
                print(f"DB update warning (non-critical): {db_error}")

            return {
                "status":            "success",
                "payment_intent_id": payment_intent_id,
                "trip_id":           intent.metadata.get("trip_id"),
                "amount_inr":        intent.metadata.get("total_inr"),
            }

        else:
            return {
                "status":            intent.status,
                "payment_intent_id": payment_intent_id,
            }

    except Exception as e:
        raise Exception(f"Stripe error: {str(e)}")

async def save_card(
    user_id: str,
    payment_method_id: str,
    card_last4: str,
    card_network: str,
    card_expiry: str,
    set_as_default: bool = True,
):
    try:
        save_payment_method(
            user_id=user_id,
            stripe_payment_method_id=payment_method_id,
            card_last4=card_last4,
            card_network=card_network,
            card_expiry=card_expiry,
            is_default=set_as_default,
        )
        return {"status": "saved", "card_last4": card_last4}

    except Exception as e:
        raise Exception(f"Failed to save card: {str(e)}")

async def handle_webhook(payload: bytes, sig_header: str):
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise Exception("Invalid webhook payload")
    except stripe.error.SignatureVerificationError:
        raise Exception("Invalid webhook signature")

    event_type = event["type"]
    data       = event["data"]["object"]

    if event_type == "payment_intent.succeeded":
        try:
            update_payment_status(
                stripe_payment_intent_id=data["id"],
                status="success",
                stripe_charge_id=data.get("latest_charge"),
            )
            trip_id = data.get("metadata", {}).get("trip_id")
            if trip_id:
                update_trip_status(trip_id=trip_id, status="confirmed")
        except Exception as db_error:
            print(f"Webhook DB warning: {db_error}")

    elif event_type == "payment_intent.payment_failed":
        try:
            update_payment_status(
                stripe_payment_intent_id=data["id"],
                status="failed",
            )
        except Exception as db_error:
            print(f"Webhook DB warning: {db_error}")

    elif event_type == "charge.refunded":
        try:
            update_payment_status(
                stripe_payment_intent_id=data.get("payment_intent"),
                status="refunded",
            )
        except Exception as db_error:
            print(f"Webhook DB warning: {db_error}")

    return {"received": True, "event": event_type}