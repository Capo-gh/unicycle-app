from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
import secrets
from datetime import datetime, timedelta, timezone

# Initialize SendGrid
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
if not SENDGRID_API_KEY:
    print("⚠️  WARNING: SENDGRID_API_KEY not set - email verification will be printed to console only")

SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "noreply@yourdomain.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def generate_verification_token():
    """Generate a secure random token for email verification"""
    return secrets.token_urlsafe(32)


def send_verification_email(email: str, name: str, token: str):
    """
    Send verification email to user using SendGrid

    Args:
        email: User's email address
        name: User's name
        token: Verification token
    """
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"

    print("=" * 50)
    print("📧 SENDING VERIFICATION EMAIL (SendGrid)")
    print(f"To: {email}")
    print(f"Name: {name}")
    print(f"Token: {token[:10]}...")
    print(f"Link: {verification_link}")
    print(f"SendGrid API Key set: {bool(SENDGRID_API_KEY)}")
    print("=" * 50)

    html_content = f"""
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

    # If SendGrid is not configured, just print the verification link
    if not SENDGRID_API_KEY:
        print("⚠️  SendGrid not configured - Verification link (copy this):")
        print(f"🔗 {verification_link}")
        print("=" * 50)
        return None

    try:
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=email,
            subject="Verify your UniCycle student account",
            html_content=html_content
        )

        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        print("✅ SENDGRID SUCCESS")
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.body}")
        print(f"Response Headers: {response.headers}")
        print("=" * 50)
        return response

    except Exception as e:
        print("❌ SENDGRID ERROR")
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
