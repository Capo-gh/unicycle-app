import resend
import os
import secrets
import html
from datetime import datetime, timedelta, timezone

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if not RESEND_API_KEY:
    print("WARNING: RESEND_API_KEY not set - emails will be printed to console only")
else:
    resend.api_key = RESEND_API_KEY

FROM_EMAIL = "noreply@unicycleapp.ca"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")


def generate_verification_token():
    return secrets.token_urlsafe(32)


def is_token_expired(token_created_at: datetime) -> bool:
    if not token_created_at:
        return True
    expiry_time = token_created_at + timedelta(hours=24)
    return datetime.now(timezone.utc) > expiry_time


def _send(to: str, subject: str, html_content: str):
    """Internal helper to send via Resend or fall back to console."""
    if not RESEND_API_KEY:
        print(f"[email] No RESEND_API_KEY -- would send to {to}: {subject}")
        return None
    params: resend.Emails.SendParams = {
        "from": FROM_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html_content,
    }
    return resend.Emails.send(params)


def send_verification_email(email: str, name: str, token: str):
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
    print(f"[email] Sending verification email to {email} -- link: {verification_link}")

    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to UniCycle!</h1>
                </div>
                <div class="content">
                    <p>Hi {html.escape(name)},</p>
                    <p>Thanks for joining UniCycle -- the student marketplace for Montreal universities!</p>
                    <p>Click below to verify your student email and set your password:</p>
                    <center>
                        <a href="{verification_link}" class="button">Verify Email Address</a>
                    </center>
                    <p><small>Or copy and paste this link:</small><br>
                    <small style="color: #22c55e;">{verification_link}</small></p>
                    <p><strong>This link expires in 24 hours.</strong></p>
                </div>
                <div class="footer">
                    <p>If you didn't create an account, ignore this email.</p>
                    <p>&copy; 2025 UniCycle</p>
                </div>
            </div>
        </body>
        </html>
    """
    _send(email, "Verify your UniCycle student account", html_content)


def send_reset_email(email: str, name: str, token: str):
    reset_link = f"{FRONTEND_URL}/reset-password?reset_token={token}"
    print(f"[email] Sending password reset email to {email} -- link: {reset_link}")

    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>Hi {html.escape(name)},</p>
                    <p>We received a request to reset your UniCycle password. Click below to set a new one:</p>
                    <center>
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </center>
                    <p><small>Or copy and paste this link:</small><br>
                    <small style="color: #22c55e;">{reset_link}</small></p>
                    <p><strong>This link expires in 24 hours.</strong></p>
                    <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 UniCycle</p>
                </div>
            </div>
        </body>
        </html>
    """
    _send(email, "Reset your UniCycle password", html_content)


def send_suspension_email(email: str, name: str):
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ef4444;">Account Suspended</h2>
                <p>Hi {html.escape(name)},</p>
                <p>Your UniCycle account has been <strong>suspended</strong> due to a violation of our community guidelines.</p>
                <p>If you believe this is a mistake, please reply to this email and our team will review your case within 24-48 hours.</p>
                <p style="font-size: 13px; color: #666;">&copy; 2025 UniCycle</p>
            </div>
        </body>
        </html>
    """
    _send(email, "Your UniCycle account has been suspended", html_content)


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
    _rn = html.escape(reporter_name)
    _re = html.escape(reporter_email)
    _ru = html.escape(reporter_university)
    _dn = html.escape(reportee_name)
    _de = html.escape(reportee_email)
    _du = html.escape(reportee_university)
    _rs = html.escape(reason)
    _dt = html.escape(details) if details else "-"

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
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_dn}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_de}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">University</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_du}</td></tr>
                    <tr style="background: #f0fdf4;">
                        <th colspan="2" style="padding: 10px; text-align: left; border: 1px solid #bbf7d0;">Reporter</th>
                    </tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_rn}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_re}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">University</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_ru}</td></tr>
                    <tr style="background: #fffbeb;">
                        <th colspan="2" style="padding: 10px; text-align: left; border: 1px solid #fde68a;">Report Details</th>
                    </tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Reason</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_rs}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Details</td><td style="padding: 8px; border: 1px solid #e5e7eb;">{_dt}</td></tr>
                </table>
            </div>
        </body>
        </html>
    """
    _send(ADMIN_EMAIL, f"[UniCycle Report] {_rn} reported {_dn}", html_content)


def send_direct_email(email: str, name: str, subject: str, message: str):
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Message from UniCycle Team</h2>
                <p>Hi {html.escape(name)},</p>
                <div style="background: white; border-left: 4px solid #22c55e; padding: 15px 20px; margin: 15px 0; white-space: pre-wrap;">{html.escape(message)}</div>
                <p style="font-size: 13px; color: #666;">&copy; 2025 UniCycle</p>
            </div>
        </body>
        </html>
    """
    _send(email, subject, html_content)


def send_message_email(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    listing_title: str,
):
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #16a34a; color: white; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">New message on UniCycle</h2>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p>Hi {html.escape(recipient_name)},</p>
                    <p><strong>{html.escape(sender_name)}</strong> sent you a message about <strong>{html.escape(listing_title)}</strong>.</p>
                    <center>
                        <a href="{FRONTEND_URL}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">View Message</a>
                    </center>
                    <p style="font-size: 13px; color: #666;">&copy; 2025 UniCycle</p>
                </div>
            </div>
        </body>
        </html>
    """
    _send(recipient_email, f"{sender_name} sent you a message on UniCycle", html_content)


def send_listing_expiry_email(
    seller_email: str,
    seller_name: str,
    listing_title: str,
    listing_id: int,
    days_left: int,
):
    day_word = "day" if days_left == 1 else "days"
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #d97706; color: white; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">Your listing is expiring soon</h2>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p>Hi {html.escape(seller_name)},</p>
                    <p>Your listing <strong>{html.escape(listing_title)}</strong> will be deactivated in <strong>{days_left} {day_word}</strong>.</p>
                    <p>Renew it from your My Listings page to keep it visible to buyers.</p>
                    <center>
                        <a href="{FRONTEND_URL}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">Renew Listing</a>
                    </center>
                    <p style="font-size: 13px; color: #666;">&copy; 2025 UniCycle</p>
                </div>
            </div>
        </body>
        </html>
    """
    _send(seller_email, f"Your listing '{listing_title}' expires in {days_left} {day_word}", html_content)


def send_review_prompt_email(
    buyer_email: str,
    buyer_name: str,
    seller_name: str,
    listing_title: str,
    seller_id: int,
):
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #16a34a; color: white; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">How was your purchase?</h2>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p>Hi {html.escape(buyer_name)},</p>
                    <p>You recently purchased <strong>{html.escape(listing_title)}</strong> from <strong>{html.escape(seller_name)}</strong>.</p>
                    <p>Help the community by leaving a quick review!</p>
                    <center>
                        <a href="{FRONTEND_URL}/user/{seller_id}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">Leave a Review</a>
                    </center>
                    <p style="font-size: 13px; color: #666;">&copy; 2025 UniCycle</p>
                </div>
            </div>
        </body>
        </html>
    """
    _send(buyer_email, f"How was buying from {seller_name} on UniCycle?", html_content)


def send_saved_search_alert_email(
    email: str,
    name: str,
    search_desc: str,
    match_count: int,
    frontend_url: str,
):
    item_word = "item" if match_count == 1 else "items"
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #2563eb; color: white; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">New listings match your search</h2>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p>Hi {html.escape(name)},</p>
                    <p><strong>{match_count} new {item_word}</strong> matching <em>{html.escape(search_desc)}</em> were just listed on UniCycle.</p>
                    <center>
                        <a href="{frontend_url}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">View Listings</a>
                    </center>
                    <p style="font-size: 13px; color: #666;">&copy; 2025 UniCycle</p>
                </div>
            </div>
        </body>
        </html>
    """
    _send(email, f"{match_count} new {item_word} match your saved search on UniCycle", html_content)
