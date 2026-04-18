// ============================================
// API BRIDGE — Only file that talks to Python backend
// frontend/src/lib/api.js
// ============================================

import { getToken } from "@/lib/auth"

let BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
// Force IPv4 loopback to avoid Windows fetch issues without needing a dev server restart
if (BACKEND_URL.includes("localhost")) {
  BACKEND_URL = BACKEND_URL.replace("localhost", "127.0.0.1")
}

async function request(endpoint, options = {}) {
  const token = getToken()
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || `API error: ${response.status}`)
  }
  return response.json()
}

// ── AI Chat ──────────────────────────────────────────────
export const sendMessage = (messages) =>
  request("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  })

// ── Trips ────────────────────────────────────────────────
export const getTripHistory = () =>
  request("/api/trips/history")

export const getTripStats = () =>
  request("/api/trips/stats")

export const saveTrip = (tripData) =>
  request("/api/trips/save", {
    method: "POST",
    body: JSON.stringify(tripData),
  })

export const getTripById = (tripId) =>
  request(`/api/trips/${tripId}`)

// ── User ─────────────────────────────────────────────────
export const getUserProfile = () =>
  request("/api/user/profile")

export const updatePreferences = (preferences) =>
  request("/api/user/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  })

// ── Payments ─────────────────────────────────────────────
export const getStripeConfig = () =>
  request("/api/payment/config")

export const createPaymentIntent = (tripId, amountInr, flightCost = 0, hotelCost = 0) =>
  request("/api/payment/create-intent", {
    method: "POST",
    body: JSON.stringify({
      trip_id:      tripId,
      amount_inr:   amountInr,
      flight_cost:  flightCost,
      hotel_cost:   hotelCost,
    }),
  })

export const confirmPayment = (paymentIntentId) =>
  request("/api/payment/confirm", {
    method: "POST",
    body: JSON.stringify({ payment_intent_id: paymentIntentId }),
  })

export const getSavedCards = () =>
  request("/api/payment/cards")

export const getPaymentHistory = () =>
  request("/api/payment/history")

// ── PDF ───────────────────────────────────────────────────
export const downloadTripPDF = (tripId) =>
  request(`/api/pdf/generate?trip_id=${tripId}`)

// ── Wishlist ──────────────────────────────────────────────
export const getWishlist = () =>
  request("/api/wishlist/")

export const addToWishlist = (destination, country = "", notes = "") =>
  request("/api/wishlist/", {
    method: "POST",
    body: JSON.stringify({ destination, country, notes }),
  })

export const removeFromWishlist = (itemId) =>
  request(`/api/wishlist/${itemId}`, { method: "DELETE" })