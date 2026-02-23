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


ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "ibrahim.sabiku@mail.mcgill.ca")


def send_report_email(
    reporter_name: str,
    reporter_email: str,
    reporter_university: str,
    reportee_name: str,
    reportee_email: str,
    reportee_university: str,
    reason: str,
    details: str = "",
):
    """Send a user-report notification to the admin inbox."""
    subject = f"[UniCycle Report] {reporter_name} reported {reportee_name}"

    html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ef4444;">User Report Received</h2>

                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr style="background: #fef2f2;">
                        <th colspan="2" style="padding: 10px; text-align: left; border: 1px solid #fecaca;">Reported User</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600; width: 30%;">Name</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{reportee_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600;">Email</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{reportee_email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600;">University</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{reportee_university}</td>
                    </tr>
                    <tr style="background: #f0fdf4;">
                        <th colspan="2" style="padding: 10px; text-align: left; border: 1px solid #bbf7d0;">Reporter</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600;">Name</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{reporter_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600;">Email</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{reporter_email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600;">University</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{reporter_university}</td>
                    </tr>
                    <tr style="background: #fffbeb;">
                        <th colspan="2" style="padding: 10px; text-align: left; border: 1px solid #fde68a;">Report Details</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600;">Reason</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{reason}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600;">Details</td>
                        <td style="padding: 8px 10px; border: 1px solid #e5e7eb;">{details or "—"}</td>
                    </tr>
                </table>
                <p style="color: #666; font-size: 13px;">Review this report and take action if necessary. You can suspend the user from the Admin dashboard.</p>
            </div>
        </body>
        </html>
    """

    if not SENDGRID_API_KEY:
        print("=" * 50)
        print("USER REPORT (SendGrid not configured)")
        print(f"Reported: {reportee_name} ({reportee_email}) @ {reportee_university}")
        print(f"Reporter: {reporter_name} ({reporter_email}) @ {reporter_university}")
        print(f"Reason: {reason} | Details: {details}")
        print("=" * 50)
        return None

    try:
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=ADMIN_EMAIL,
            subject=subject,
            html_content=html_content,
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        return sg.send(message)
    except Exception as e:
        print(f"Failed to send report email: {str(e)}")
        raise Exception(f"Failed to send report email: {str(e)}")


def send_suspension_email(email: str, name: str):
    """Send account suspension notification to user"""
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚫 Account Suspended</h1>
                </div>
                <div class="content">
                    <p>Hi {name},</p>
                    <p>Your UniCycle account has been <strong>suspended</strong> due to a violation of our community guidelines.</p>
                    <p>You will no longer be able to sign in or access the marketplace.</p>
                    <p>If you believe this is a mistake, please contact us by replying to this email and our team will review your case within 24–48 hours.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 13px; color: #666;">
                        Common reasons for suspension include: posting fraudulent listings, harassment of other users, or repeated violations of our terms of service.
                    </p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 UniCycle - Student Marketplace</p>
                </div>
            </div>
        </body>
        </html>
    """

    if not SENDGRID_API_KEY:
        print("=" * 50)
        print(f"ACCOUNT SUSPENDED: {name} ({email})")
        print("=" * 50)
        return None

    try:
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=email,
            subject="Your UniCycle account has been suspended",
            html_content=html_content
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        return sg.send(message)
    except Exception as e:
        print(f"Failed to send suspension email: {str(e)}")


def send_reset_email(email: str, name: str, token: str):
    """Send password reset email using SendGrid"""
    reset_link = f"{FRONTEND_URL}?reset_token={token}"

    print("=" * 50)
    print("📧 SENDING PASSWORD RESET EMAIL")
    print(f"To: {email}")
    print(f"Link: {reset_link}")
    print("=" * 50)

    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>Hi {name},</p>
                    <p>We received a request to reset your UniCycle password. Click the button below to set a new password:</p>
                    <center>
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </center>
                    <p><small>Or copy and paste this link:</small><br>
                    <small style="color: #4CAF50;">{reset_link}</small></p>
                    <p><strong>This link expires in 24 hours.</strong></p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 UniCycle - Student Marketplace</p>
                </div>
            </div>
        </body>
        </html>
    """

    if not SENDGRID_API_KEY:
        print("⚠️  SendGrid not configured - Reset link (copy this):")
        print(f"🔗 {reset_link}")
        print("=" * 50)
        return None

    try:
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=email,
            subject="Reset your UniCycle password",
            html_content=html_content
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        return sg.send(message)
    except Exception as e:
        print(f"❌ Failed to send reset email: {str(e)}")
        raise Exception(f"Failed to send reset email: {str(e)}")


def send_direct_email(email: str, name: str, subject: str, message: str):
    """Send a direct admin message to a specific user"""
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .message-box {{ background: white; border-left: 4px solid #4CAF50; padding: 15px 20px; margin: 15px 0; border-radius: 0 6px 6px 0; white-space: pre-wrap; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📬 Message from UniCycle Team</h1>
                </div>
                <div class="content">
                    <p>Hi {name},</p>
                    <div class="message-box">{message}</div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 14px; color: #666;">This message was sent by the UniCycle moderation team. If you have questions, reply to this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 UniCycle - Student Marketplace</p>
                </div>
            </div>
        </body>
        </html>
    """

    if not SENDGRID_API_KEY:
        print(f"[Direct Email] To: {email} | Subject: {subject}")
        print(message)
        return None

    try:
        mail = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=email,
            subject=subject,
            html_content=html_content
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        return sg.send(mail)
    except Exception as e:
        print(f"Failed to send direct email: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")


def is_token_expired(token_created_at: datetime) -> bool:
    """Check if verification token is expired (24 hours)"""
    if not token_created_at:
        return True
    expiry_time = token_created_at + timedelta(hours=24)
    return datetime.now(timezone.utc) > expiry_time
