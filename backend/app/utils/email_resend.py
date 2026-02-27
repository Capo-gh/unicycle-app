import resend
import os
import secrets
from datetime import datetime, timedelta, timezone

# Initialize Resend
resend.api_key = os.getenv("RESEND_API_KEY")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def generate_verification_token():
    """Generate a secure random token for email verification"""
    return secrets.token_urlsafe(32)


def send_verification_email(email: str, name: str, token: str):
    """
    Send verification email to user using Resend

    Args:
        email: User's email address
        name: User's name
        token: Verification token
    """
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"

    print("=" * 50)
    print("📧 SENDING VERIFICATION EMAIL")
    print(f"To: {email}")
    print(f"Name: {name}")
    print(f"Token: {token[:10]}...")
    print(f"Link: {verification_link}")
    print(f"Resend API Key set: {bool(resend.api_key)}")
    print("=" * 50)

    try:
        params = {
            "from": "UniCycle <onboarding@resend.dev>",  # Change to your domain once verified
            "to": [email],
            "subject": "Verify your UniCycle student account",
            "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Welcome to UniCycle!</h1>
                        </div>
                        <div class="content">
                            <p>Hi {name},</p>
                            <p>Thanks for joining UniCycle - the verified student marketplace for Montreal universities!</p>
                            <p>To complete your registration and start buying, selling, and connecting with fellow students, please verify your student email address:</p>
                            <center>
                                <a href="{verification_link}" class="button">Verify Email Address</a>
                            </center>
                            <p><small>Or copy and paste this link into your browser:</small><br>
                            <small style="color: #667eea;">{verification_link}</small></p>
                            <p><strong>This link expires in 24 hours.</strong></p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                            <p style="font-size: 14px; color: #666;">
                                Once verified, you'll be able to:
                                <ul>
                                    <li>✅ Post listings and sell items</li>
                                    <li>✅ Message sellers directly</li>
                                    <li>✅ Create requests for items you need</li>
                                    <li>✅ Build your reputation through reviews</li>
                                </ul>
                            </p>
                        </div>
                        <div class="footer">
                            <p>If you didn't create an account, please ignore this email.</p>
                            <p>&copy; 2025 UniCycle - Student Marketplace</p>
                        </div>
                    </div>
                </body>
                </html>
            """
        }

        response = resend.Emails.send(params)
        print("✅ RESEND SUCCESS")
        print(f"Response: {response}")
        print("=" * 50)
        return response

    except Exception as e:
        print("❌ RESEND ERROR")
        print(f"Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print("=" * 50)
        raise Exception(f"Failed to send verification email: {str(e)}")


def is_token_expired(token_created_at: datetime) -> bool:
    """Check if verification token is expired (24 hours)"""
    if not token_created_at:
        return True
    expiry_time = token_created_at + timedelta(hours=24)
    return datetime.now(timezone.utc) > expiry_time


def send_message_email(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    listing_title: str,
):
    """
    Notify a user by email that they have a new message.
    Only called when the recipient has not replied yet in the conversation,
    to avoid spamming active back-and-forth threads.
    """
    messages_link = FRONTEND_URL
    try:
        params = {
            "from": "UniCycle <onboarding@resend.dev>",
            "to": [recipient_email],
            "subject": f"{sender_name} sent you a message on UniCycle",
            "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: #16a34a; color: white; padding: 24px 30px; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .button {{ display: inline-block; background: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }}
                        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2 style="margin:0;">New message on UniCycle</h2>
                        </div>
                        <div class="content">
                            <p>Hi {recipient_name},</p>
                            <p><strong>{sender_name}</strong> sent you a message about <strong>{listing_title}</strong>.</p>
                            <center>
                                <a href="{messages_link}" class="button">View Message</a>
                            </center>
                            <p style="font-size:13px; color:#666;">
                                Reply quickly to keep the deal moving!
                            </p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 UniCycle &mdash; Student Marketplace</p>
                        </div>
                    </div>
                </body>
                </html>
            """
        }
        resend.Emails.send(params)
    except Exception as e:
        print(f"[email] Failed to send message notification: {e}")


def send_listing_expiry_email(
    seller_email: str,
    seller_name: str,
    listing_title: str,
    listing_id: int,
    days_left: int,
):
    """Warn a seller that their listing is expiring soon."""
    renew_link = FRONTEND_URL
    day_word = "day" if days_left == 1 else "days"
    try:
        params = {
            "from": "UniCycle <onboarding@resend.dev>",
            "to": [seller_email],
            "subject": f"Your listing '{listing_title}' expires in {days_left} {day_word}",
            "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: #d97706; color: white; padding: 24px 30px; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .button {{ display: inline-block; background: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }}
                        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2 style="margin:0;">Your listing is expiring soon</h2>
                        </div>
                        <div class="content">
                            <p>Hi {seller_name},</p>
                            <p>Your listing <strong>{listing_title}</strong> will be automatically deactivated in <strong>{days_left} {day_word}</strong>.</p>
                            <p>Renew it from your My Listings page to keep it visible to buyers.</p>
                            <center>
                                <a href="{renew_link}" class="button">Renew Listing</a>
                            </center>
                            <p style="font-size:13px; color:#666;">
                                Renewing is free and extends your listing for another 60 days.
                            </p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 UniCycle &mdash; Student Marketplace</p>
                        </div>
                    </div>
                </body>
                </html>
            """
        }
        resend.Emails.send(params)
    except Exception as e:
        print(f"[email] Failed to send expiry warning: {e}")
