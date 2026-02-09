import resend
import os
import secrets
from datetime import datetime, timedelta

# Initialize Resend
resend.api_key = os.getenv("RESEND_API_KEY", "re_ACkvjdmT_Kq7cwm3VQdoSinRPzQzKrf4o")

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
        return response

    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        raise Exception(f"Failed to send verification email: {str(e)}")


def is_token_expired(token_created_at: datetime) -> bool:
    """Check if verification token is expired (24 hours)"""
    if not token_created_at:
        return True
    expiry_time = token_created_at + timedelta(hours=24)
    return datetime.now() > expiry_time
