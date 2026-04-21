# ============================================
# TRIPAI — PDF Ticket Generation
# backend/services/pdf_service.py
# Uses ReportLab to generate trip ticket PDF
# ============================================

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, Image
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
import requests
import qrcode
from datetime import datetime


# ============================================
# COLOURS
# ============================================

DARK_BG     = colors.HexColor("#0f172a")
BLUE        = colors.HexColor("#3b82f6")
LIGHT_BLUE  = colors.HexColor("#eff6ff")
GRAY        = colors.HexColor("#64748b")
LIGHT_GRAY  = colors.HexColor("#f1f5f9")
WHITE       = colors.white
GREEN       = colors.HexColor("#22c55e")
DARK_TEXT   = colors.HexColor("#1e293b")


# ============================================
# STYLES
# ============================================

def get_styles():
    return {
        "title": ParagraphStyle(
            "title",
            fontSize=26,
            textColor=WHITE,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            fontSize=11,
            textColor=colors.HexColor("#93c5fd"),
            fontName="Helvetica",
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "section_header": ParagraphStyle(
            "section_header",
            fontSize=11,
            textColor=BLUE,
            fontName="Helvetica-Bold",
            spaceBefore=14,
            spaceAfter=6,
        ),
        "label": ParagraphStyle(
            "label",
            fontSize=8,
            textColor=GRAY,
            fontName="Helvetica",
            spaceAfter=1,
        ),
        "value": ParagraphStyle(
            "value",
            fontSize=10,
            textColor=DARK_TEXT,
            fontName="Helvetica-Bold",
            spaceAfter=2,
        ),
        "body": ParagraphStyle(
            "body",
            fontSize=9,
            textColor=DARK_TEXT,
            fontName="Helvetica",
            spaceAfter=3,
            leading=14,
        ),
        "total": ParagraphStyle(
            "total",
            fontSize=13,
            textColor=WHITE,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontSize=8,
            textColor=GRAY,
            fontName="Helvetica",
            alignment=TA_CENTER,
        ),
        "day_title": ParagraphStyle(
            "day_title",
            fontSize=10,
            textColor=BLUE,
            fontName="Helvetica-Bold",
            spaceAfter=2,
        ),
        "day_body": ParagraphStyle(
            "day_body",
            fontSize=9,
            textColor=DARK_TEXT,
            fontName="Helvetica",
            leading=13,
            spaceAfter=2,
        ),
        "confirmed": ParagraphStyle(
            "confirmed",
            fontSize=9,
            textColor=GREEN,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        ),
    }


# ============================================
# HELPER — info grid table
# ============================================

def info_grid(data: list, styles: dict, col_widths=None):
    """
    data = [
        [("LABEL", "value"), ("LABEL", "value")],
        ...
    ]
    """
    table_data = []
    for row in data:
        label_row = []
        value_row = []
        for label, value in row:
            label_row.append(Paragraph(label, styles["label"]))
            value_row.append(Paragraph(str(value), styles["value"]))
        table_data.append(label_row)
        table_data.append(value_row)

    w = col_widths or [85 * mm / len(data[0])] * len(data[0])
    t = Table(table_data, colWidths=w)
    t.setStyle(TableStyle([
        ("VALIGN",      (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",(0, 0), (-1, -1), 8),
        ("TOPPADDING",  (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING",(0,0), (-1, -1), 2),
    ]))
    return t


# ============================================
-- HELPER — Fetch city image
# ============================================

def fetch_city_image(destination: str, width: int = 600, height: int = 300) -> BytesIO:
    """Fetches a city cover image from Unsplash as a buffer."""
    try:
        encoded = requests.utils.quote(f"{destination} city travel")
        url = f"https://source.unsplash.com/{width}x{height}/?{encoded}"
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            return BytesIO(response.content)
    except Exception as e:
        print(f"IMAGE FETCH ERROR: {e}")
    return None


# ============================================
-- HELPER — Generate QR code
# ============================================

def generate_qr_code(url: str) -> BytesIO:
    """Generates a QR code image as a buffer."""
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer
    except Exception as e:
        print(f"QR GEN ERROR: {e}")
    return None


# ============================================
# MAIN FUNCTION
# ============================================

def generate_trip_ticket(trip_data: dict, user_data: dict, payment_data: dict = None) -> bytes:
    """
    Generates a complete trip ticket PDF.

    Args:
        trip_data:    Row from trips table (+ optional flight/hotel/itinerary)
        user_data:    Row from users table
        payment_data: Row from payments table (optional)

    Returns:
        PDF as bytes — ready to send as HTTP response
    """

    buffer = BytesIO()
    PAGE_W, PAGE_H = A4
    MARGIN = 15 * mm

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
    )

    styles = get_styles()
    story  = []
    W      = PAGE_W - 2 * MARGIN   # usable width


    # ── HEADER BANNER ────────────────────────────────────────

    header_data = [[
        Paragraph("TripAI", styles["title"]),
    ]]
    header_table = Table(header_data, colWidths=[W])
    header_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), DARK_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ("ROUNDEDCORNERS", [6]),
    ]))
    story.append(header_table)

    subtitle_data = [[Paragraph("AI-Powered Travel · Official Trip Ticket", styles["subtitle"])]]
    subtitle_table = Table(subtitle_data, colWidths=[W])
    subtitle_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), DARK_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
    ]))
    story.append(subtitle_table)
    story.append(Spacer(1, 4))


    # ── CITY COVER IMAGE (PRO FEATURE) ───────────────────────
    
    city_name = trip_data.get("destination", "Explore")
    img_buffer = fetch_city_image(city_name, width=540, height=180)
    if img_buffer:
        try:
            city_img = Image(img_buffer, width=W, height=50*mm)
            story.append(city_img)
            story.append(Spacer(1, 10))
        except:
            # Fallback gold banner if image load fails
            banner = Table([[""]], colWidths=[W], rowHeights=[30*mm])
            banner.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#f59e0b")),
                ("ROUNDEDCORNERS", [12]),
            ]))
            story.append(banner)
            story.append(Spacer(1, 10))
    else:
        # Fallback banner if image fetch fails
        banner = Table([[""]], colWidths=[W], rowHeights=[30*mm])
        banner.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#f59e0b")),
            ("ROUNDEDCORNERS", [12]),
        ]))
        story.append(banner)
        story.append(Spacer(1, 10))

    # Confirmed badge
    if payment_data and payment_data.get("status") == "success":
        story.append(Paragraph("BOOKING CONFIRMED", styles["confirmed"]))
    story.append(Spacer(1, 8))


    # ── BOOKING REFERENCE ────────────────────────────────────

    ref = payment_data.get("stripe_payment_intent_id", "N/A")[:20] if payment_data else "N/A"
    issued = datetime.now().strftime("%d %b %Y, %I:%M %p")

    story.append(Paragraph("BOOKING DETAILS", styles["section_header"]))
    story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))

    story.append(info_grid([
        [("BOOKING REF", ref), ("ISSUED ON", issued), ("STATUS", "Confirmed" if payment_data else "Planned")],
    ], styles, col_widths=[W * 0.4, W * 0.35, W * 0.25]))
    story.append(Spacer(1, 8))


    # ── PASSENGER INFO ───────────────────────────────────────

    story.append(Paragraph("PASSENGER", styles["section_header"]))
    story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))

    story.append(info_grid([
        [
            ("FULL NAME",    user_data.get("full_name", "N/A")),
            ("EMAIL",        user_data.get("email", "N/A")),
            ("NATIONALITY",  user_data.get("nationality") or "N/A"),
        ]
    ], styles, col_widths=[W * 0.35, W * 0.40, W * 0.25]))
    story.append(Spacer(1, 8))


    # ── TRIP OVERVIEW ─────────────────────────────────────────

    story.append(Paragraph("TRIP OVERVIEW", styles["section_header"]))
    story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))

    story.append(info_grid([
        [
            ("DESTINATION",   trip_data.get("destination", "N/A")),
            ("ORIGIN",        trip_data.get("origin", "N/A")),
            ("DURATION",      f"{trip_data.get('duration_days', 'N/A')} days"),
            ("TRAVELLERS",    str(trip_data.get("num_travelers", 1))),
        ]
    ], styles, col_widths=[W * 0.30, W * 0.25, W * 0.22, W * 0.23]))
    story.append(Spacer(1, 4))

    story.append(info_grid([
        [
            ("DEPARTURE DATE", str(trip_data.get("start_date", "N/A"))),
            ("RETURN DATE",    str(trip_data.get("end_date", "N/A"))),
            ("CURRENCY",       trip_data.get("currency", "INR")),
        ]
    ], styles, col_widths=[W * 0.35, W * 0.35, W * 0.30]))
    story.append(Spacer(1, 8))


    # ── FLIGHT DETAILS ────────────────────────────────────────

    flight = trip_data.get("flight")
    if flight:
        story.append(Paragraph("FLIGHT DETAILS", styles["section_header"]))
        story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))

        story.append(info_grid([
            [
                ("OUTBOUND AIRLINE",  flight.get("outbound_airline", "N/A")),
                ("FLIGHT NO",         flight.get("outbound_flight_no", "N/A")),
                ("CABIN CLASS",       flight.get("outbound_cabin_class", "Economy")),
                ("PRICE",             f"Rs.{flight.get('outbound_price', 0):,.0f}"),
            ]
        ], styles, col_widths=[W * 0.30, W * 0.20, W * 0.25, W * 0.25]))
        story.append(Spacer(1, 4))

        story.append(info_grid([
            [
                ("RETURN AIRLINE",    flight.get("return_airline", "N/A")),
                ("FLIGHT NO",         flight.get("return_flight_no", "N/A")),
                ("CABIN CLASS",       flight.get("return_cabin_class", "Economy")),
                ("PRICE",             f"Rs.{flight.get('return_price', 0):,.0f}"),
            ]
        ], styles, col_widths=[W * 0.30, W * 0.20, W * 0.25, W * 0.25]))
        story.append(Spacer(1, 8))


    # ── HOTEL DETAILS ─────────────────────────────────────────

    hotel = trip_data.get("hotel")
    if hotel:
        story.append(Paragraph("HOTEL DETAILS", styles["section_header"]))
        story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))

        story.append(info_grid([
            [
                ("HOTEL NAME",   hotel.get("hotel_name", "N/A")),
                ("STARS",        "*" * int(hotel.get("hotel_stars", 0))),
                ("ROOM TYPE",    hotel.get("room_type", "N/A")),
            ]
        ], styles, col_widths=[W * 0.45, W * 0.20, W * 0.35]))
        story.append(Spacer(1, 4))

        story.append(info_grid([
            [
                ("CHECK-IN",         str(hotel.get("checkin_date", "N/A"))),
                ("CHECK-OUT",        str(hotel.get("checkout_date", "N/A"))),
                ("NIGHTS",           str(hotel.get("num_nights", "N/A"))),
                ("TOTAL COST",       f"Rs.{hotel.get('total_hotel_cost', 0):,.0f}"),
            ]
        ], styles, col_widths=[W * 0.25, W * 0.25, W * 0.20, W * 0.30]))
        story.append(Spacer(1, 8))


    # ── ITINERARY ────────────────────────────────────────────

    itinerary = trip_data.get("itinerary", [])
    if itinerary:
        story.append(Paragraph("DAY-BY-DAY ITINERARY", styles["section_header"]))
        story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))

        for day in itinerary:
            day_num   = day.get("day_number", "")
            day_title = day.get("title", f"Day {day_num}")
            day_desc  = day.get("description", "")

            story.append(Paragraph(f"Day {day_num} — {day_title}", styles["day_title"]))
            if day_desc:
                story.append(Paragraph(day_desc, styles["day_body"]))

            places = day.get("places", [])
            if places and isinstance(places, list):
                place_names = ", ".join(
                    p.get("name", str(p)) if isinstance(p, dict) else str(p)
                    for p in places
                )
                story.append(Paragraph(f"Places: {place_names}", styles["day_body"]))

            story.append(Spacer(1, 4))

        story.append(Spacer(1, 4))


    # ── COST SUMMARY ─────────────────────────────────────────

    story.append(Paragraph("COST SUMMARY", styles["section_header"]))
    story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))

    if payment_data:
        tax           = float(payment_data.get("tax_amount") or 0)
        platform_fee  = float(payment_data.get("platform_fee") or 0)
        total         = float(payment_data.get("amount") or 0)
        flight_cost   = float(payment_data.get("flight_cost") or 0)
        hotel_cost    = float(payment_data.get("hotel_cost") or 0)
        
        # Fallback for dynamic mock layout incase db is strictly zero
        if flight_cost == 0 and hotel_cost == 0:
            flight_cost = (total - tax - platform_fee) * 0.40
            hotel_cost  = (total - tax - platform_fee) * 0.60
    else:
        total         = float(trip_data.get("total_cost") or 0)
        tax           = total * 0.05
        platform_fee  = total * 0.02
        flight_cost   = total * 0.40
        hotel_cost    = total * 0.60
        total         = total + tax + platform_fee

    cost_rows = [
        ["Description", "Amount"],
        ["Flights",      f"Rs.{flight_cost:,.2f}"],
        ["Hotels",       f"Rs.{hotel_cost:,.2f}"],
        ["Tax (5%)",     f"Rs.{tax:,.2f}"],
        ["Platform Fee (2%)", f"Rs.{platform_fee:,.2f}"],
        ["TOTAL",        f"Rs.{total:,.2f}"],
    ]

    cost_table = Table(cost_rows, colWidths=[W * 0.65, W * 0.35])
    cost_table.setStyle(TableStyle([
        # Header row
        ("BACKGROUND",    (0, 0), (-1, 0), DARK_BG),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 9),
        ("ALIGN",         (1, 0), (1, -1), "RIGHT"),
        # Body rows
        ("FONTNAME",      (0, 1), (-1, -2), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -2), 9),
        ("TEXTCOLOR",     (0, 1), (-1, -2), DARK_TEXT),
        ("ROWBACKGROUNDS",(0, 1), (-1, -2), [WHITE, LIGHT_GRAY]),
        # Total row
        ("BACKGROUND",    (0, -1), (-1, -1), BLUE),
        ("TEXTCOLOR",     (0, -1), (-1, -1), WHITE),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, -1), (-1, -1), 11),
        # Padding
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
    ]))
    story.append(cost_table)
    story.append(Spacer(1, 12))


    # ── FOOTER ───────────────────────────────────────────────

    story.append(HRFlowable(width=W, thickness=0.5, color=LIGHT_GRAY, spaceAfter=6))
    story.append(Paragraph(
        f"Generated by TripAI · {datetime.now().strftime('%d %b %Y')} · This is an AI-generated trip ticket.",
        styles["footer"]
    ))
    story.append(Paragraph(
        "For support contact: support@tripai.com",
        styles["footer"]
    ))
    story.append(Spacer(1, 10))

    # ── QR CODE (PRO FEATURE) ────────────────────────────────
    
    # Generate live URL: domain + chat + destination (or trip_id if tracked)
    frontend_domain = "https://trip-ai-app-git-main-sufiyaan-shaikhs-projects.vercel.app"
    live_url = f"{frontend_domain}/chat?destination={requests.utils.quote(city_name)}"
    
    qr_buffer = generate_qr_code(live_url)
    if qr_buffer:
        try:
            qr_img = Image(qr_buffer, width=25*mm, height=25*mm)
            qr_table = Table([[
                qr_img,
                Paragraph("<br/>SCAN TO VIEW LIVE TRIP<br/>ON YOUR MOBILE", styles["footer"])
            ]], colWidths=[30*mm, 60*mm])
            qr_table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ]))
            story.append(qr_table)
        except:
            pass


    # ── BUILD ────────────────────────────────────────────────

    doc.build(story)
    buffer.seek(0)
    return buffer.read()