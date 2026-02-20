import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from datetime import datetime, timedelta
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

# 🔥 force load .env from same folder
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")

print("SENDGRID_API_KEY loaded:", SENDGRID_API_KEY is not None)
print("FROM_EMAIL loaded:", FROM_EMAIL)


def send_payment_request_email(customer_email, booking_id, price):
    deadline_time = datetime.now() + timedelta(hours=5)

    subject = "MoveMate Booking Accepted – Complete Your Payment"

    html_content = f"""
    <h2>Booking Accepted ✅</h2>
    <p>Your booking <b>#{booking_id}</b> has been accepted by the agency.</p>
    <p><b>Price:</b> ₹{price}</p>
    <p>Please complete the payment within <b>5 hours</b>.</p>
    <p><b>Payment Deadline:</b> {deadline_time.strftime('%d %b %Y, %I:%M %p')}</p>
    <br>
    <p>Thanks,<br><b>MoveMate Team 🚚</b></p>
    """

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=customer_email,
        subject=subject,
        html_content=html_content
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print("✅ SendGrid status:", response.status_code)
        return True
    except Exception as e:
        print("❌ Email error:", e)
        return False
def send_driver_assigned_email(customer_email, booking_id, pickup, drop, date_time):
    subject = f"🚚 MoveMate | Driver & Vehicle Assigned | Booking {booking_id}"


    html_content = f"""
    <p>Dear Customer,</p>

    <p>Your booking has been <b>successfully confirmed</b>.
    A driver and vehicle have been assigned to your request.</p>

    <p><b>Booking ID:</b> {booking_id}</p>
    <p>
    You can track your shipment anytime on our website using this Booking ID.
    </p>
    <p><b>Pickup:</b> {pickup}</p>
    <p><b>Drop:</b> {drop}</p>
    <p><b>Date & Time:</b> {date_time}</p>

    <p>Please ensure availability at the pickup location at the scheduled time.</p>

    <br>
    <p>Thank you for choosing our service.</p>
    <p><b>MoveMate Team</b></p>
    """

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=customer_email,
        subject=subject,
        html_content=html_content
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        print("📧 Sending driver assigned email to:", customer_email)

        sg.send(message)
        return True
    except Exception as e:
        print("Driver assigned email error:", e)
        return False